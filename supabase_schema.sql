-- Laz2a Supabase schema and secure checkout RPCs.
-- Run this file in the Supabase SQL Editor, then run supabase_catalog_seed.sql.
-- The browser receives only the publishable/anon key; it cannot write orders,
-- read coupon rows, or change the trusted catalog prices directly.

create table if not exists public.orders (
  id                       bigserial primary key,
  created_at               timestamptz not null default now(),
  customer_name            text        not null,
  phone                    text        not null,
  address                  text        not null default '',
  total_amount             numeric(12,2) not null,
  subtotal_amount          numeric(12,2) not null default 0,
  promo_discount_amount    numeric(12,2) not null default 0,
  coupon_code              text,
  coupon_percent           numeric(5,2),
  coupon_discount_amount   numeric(12,2) not null default 0,
  delivery_fee             numeric(12,2) not null default 0,
  paid_qty                 integer,
  free_qty                 integer,
  total_qty                integer,
  items                    jsonb       not null default '[]'::jsonb,
  delivery_method          text        not null default 'obour_institutes',
  metro_station            text,
  notes                    text
);

-- Idempotent migration for projects with an existing orders table.
alter table public.orders add column if not exists address text not null default '';
alter table public.orders add column if not exists delivery_method text not null default 'obour_institutes';
alter table public.orders alter column delivery_method set default 'obour_institutes';
alter table public.orders add column if not exists metro_station text;
alter table public.orders add column if not exists notes text;
alter table public.orders add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.orders add column if not exists subtotal_amount numeric(12,2) not null default 0;
alter table public.orders add column if not exists promo_discount_amount numeric(12,2) not null default 0;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists coupon_percent numeric(5,2);
alter table public.orders add column if not exists coupon_discount_amount numeric(12,2) not null default 0;
alter table public.orders add column if not exists delivery_fee numeric(12,2) not null default 0;

-- Trusted prices and titles: only the database owner can read or edit this table.
-- Populate/update it by running the generated supabase_catalog_seed.sql file.
create table if not exists public.catalog_products (
  product_id   bigint primary key,
  title        text not null,
  is_collection boolean not null default false,
  unit_price   numeric(12,2) not null check (unit_price >= 0),
  active       boolean not null default true,
  updated_at   timestamptz not null default now()
);
alter table public.catalog_products enable row level security;
revoke all on table public.catalog_products from public, anon, authenticated;

-- Coupon codes are managed through the Supabase SQL Editor by the project owner.
-- No browser role may select or change coupon configuration or usage counts.
create table if not exists public.coupons (
  code              text primary key,
  discount_percent  numeric(5,2) not null check (discount_percent > 0 and discount_percent <= 100),
  max_uses          integer not null check (max_uses > 0),
  used_count        integer not null default 0 check (used_count >= 0),
  active            boolean not null default true,
  starts_at         timestamptz,
  expires_at        timestamptz,
  created_at        timestamptz not null default now(),
  constraint coupons_code_format check (code = upper(btrim(code)) and code ~ '^[A-Z0-9_-]{3,32}$'),
  constraint coupons_time_window check (expires_at is null or starts_at is null or expires_at > starts_at)
);
alter table public.coupons enable row level security;
revoke all on table public.coupons from public, anon, authenticated;

-- Admin allowlist; membership is managed only in the SQL Editor or a trusted server.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on table public.admin_users from public, anon, authenticated;
grant select on table public.admin_users to authenticated;
drop policy if exists "Admins can read their own membership" on public.admin_users;
create policy "Admins can read their own membership"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

alter table public.orders enable row level security;
drop policy if exists "Allow anon inserts" on public.orders;
drop policy if exists "Allow authenticated inserts" on public.orders;
drop policy if exists "Public checkout inserts" on public.orders;
drop policy if exists "Allow authenticated reads" on public.orders;
drop policy if exists "Only listed admins can read orders" on public.orders;
revoke all on table public.orders from public, anon, authenticated;
grant select on table public.orders to authenticated;
create policy "Only listed admins can read orders"
  on public.orders for select to authenticated
  using (exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  ));

-- Remove direct sequence access too; orders are created only by submit_order().
do $$
declare order_seq regclass;
begin
  order_seq := pg_get_serial_sequence('public.orders', 'id');
  if order_seq is not null then
    execute format('revoke all on sequence %s from public, anon, authenticated', order_seq);
  end if;
end;
$$;

-- Private server-side price calculation. Inputs contain only product IDs and
-- quantities; titles and prices are loaded from catalog_products, never trusted
-- from browser-supplied totals, names, or prices. Existing buy-X-get-Y tiers
-- from src/utils/promotions.js are reproduced here.
create or replace function public._laz2a_order_totals(
  p_items jsonb,
  p_delivery_method text,
  p_metro_station text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_input_count integer;
  v_valid_count integer;
  v_unique_count integer;
  v_total_qty integer;
  v_individual_qty integer;
  v_subtotal numeric(12,2);
  v_free_items integer;
  v_promo_discount numeric(12,2);
  v_delivery_fee numeric(12,2);
  v_items_snapshot jsonb;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception using errcode = '22023', message = 'ORDER_ITEMS_INVALID';
  end if;
  v_input_count := jsonb_array_length(p_items);
  if v_input_count < 1 then
    raise exception using errcode = '22023', message = 'ORDER_ITEMS_INVALID';
  end if;
  if p_delivery_method is null or p_delivery_method not in ('metro_station', 'obour_institutes', 'obour_university', 'helwan_university', 'ain_shams_university') then
    raise exception using errcode = '22023', message = 'DELIVERY_METHOD_INVALID';
  end if;
  if p_delivery_method = 'metro_station' and (p_metro_station is null or length(btrim(p_metro_station)) < 3 or length(p_metro_station) > 150) then
    raise exception using errcode = '22023', message = 'METRO_STATION_REQUIRED';
  end if;

  select
    count(*)::integer,
    count(cp.product_id) filter (where x.quantity between 1 and 500)::integer,
    count(distinct x.id) filter (where cp.product_id is not null and x.quantity between 1 and 500)::integer,
    coalesce(sum(x.quantity) filter (where cp.product_id is not null and x.quantity between 1 and 500), 0)::integer,
    coalesce(sum(x.quantity) filter (where cp.product_id is not null and x.quantity between 1 and 500 and not cp.is_collection), 0)::integer,
    coalesce(sum(cp.unit_price * x.quantity) filter (where cp.product_id is not null and x.quantity between 1 and 500), 0)::numeric(12,2)
  into v_input_count, v_valid_count, v_unique_count, v_total_qty, v_individual_qty, v_subtotal
  from jsonb_to_recordset(p_items) as x(id bigint, quantity integer)
  left join public.catalog_products as cp on cp.product_id = x.id and cp.active;

  if v_valid_count <> v_input_count or v_unique_count <> v_input_count or v_total_qty > 5000 then
    raise exception using errcode = '22023', message = 'ORDER_ITEMS_INVALID';
  end if;

  v_free_items := case
    when v_individual_qty >= 155 then 55
    when v_individual_qty >= 110 then 35
    when v_individual_qty >= 70 then 20
    when v_individual_qty >= 55 then 15
    when v_individual_qty >= 40 then 10
    when v_individual_qty >= 25 then 5
    when v_individual_qty >= 12 then 2
    else 0
  end;
  v_promo_discount := v_free_items * 10;
  v_delivery_fee := case when p_delivery_method = 'metro_station' then 50 else 0 end;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', cp.product_id,
    'name', cp.title,
    'quantity', x.quantity,
    'price', round(cp.unit_price * x.quantity, 2),
    'unit_price', cp.unit_price,
    'is_collection', cp.is_collection
  ) order by cp.product_id), '[]'::jsonb)
  into v_items_snapshot
  from jsonb_to_recordset(p_items) as x(id bigint, quantity integer)
  join public.catalog_products as cp on cp.product_id = x.id and cp.active;

  return jsonb_build_object(
    'items', v_items_snapshot,
    'subtotal_amount', v_subtotal,
    'promo_discount_amount', v_promo_discount,
    'amount_before_coupon', greatest(0, v_subtotal - v_promo_discount),
    'delivery_fee', v_delivery_fee,
    'total_amount', greatest(0, v_subtotal - v_promo_discount) + v_delivery_fee,
    'free_items', v_free_items,
    'total_qty', v_total_qty,
    'individual_qty', v_individual_qty
  );
end;
$function$;

-- Coupon preview never reserves/consumes a use. Final checkout checks again
-- while holding a row lock, then increments the counter in the same transaction
-- that inserts the order.
create or replace function public.preview_coupon(
  p_code text,
  p_items jsonb,
  p_delivery_method text,
  p_metro_station text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_coupon public.coupons%rowtype;
  v_totals jsonb;
  v_coupon_discount numeric(12,2);
  v_total numeric(12,2);
begin
  if p_code is null or btrim(p_code) = '' then
    return jsonb_build_object('valid', false, 'message', 'اكتب كود الكوبون أولاً.');
  end if;

  v_totals := public._laz2a_order_totals(p_items, p_delivery_method, p_metro_station);
  select * into v_coupon from public.coupons where code = upper(btrim(p_code));
  if not found then
    return jsonb_build_object('valid', false, 'message', 'الكوبون غير صالح أو غير متاح.');
  end if;
  if not v_coupon.active then
    return jsonb_build_object('valid', false, 'message', 'الكوبون غير صالح أو غير متاح.');
  end if;
  if v_coupon.starts_at is not null and v_coupon.starts_at > now() then
    return jsonb_build_object('valid', false, 'message', 'الكوبون لم يبدأ بعد.');
  end if;
  if v_coupon.expires_at is not null and v_coupon.expires_at <= now() then
    return jsonb_build_object('valid', false, 'message', 'انتهت صلاحية الكوبون.');
  end if;
  if v_coupon.used_count >= v_coupon.max_uses then
    return jsonb_build_object('valid', false, 'message', 'وصل الكوبون إلى الحد الأقصى للاستخدام.');
  end if;

  v_coupon_discount := round((v_totals->>'amount_before_coupon')::numeric * v_coupon.discount_percent / 100, 2);
  v_total := greatest(0, (v_totals->>'amount_before_coupon')::numeric - v_coupon_discount) + (v_totals->>'delivery_fee')::numeric;
  return v_totals || jsonb_build_object(
    'valid', true,
    'message', 'تم تطبيق الكوبون بنجاح.',
    'coupon_code', v_coupon.code,
    'coupon_percent', v_coupon.discount_percent,
    'coupon_discount_amount', v_coupon_discount,
    'total_amount', v_total
  );
end;
$function$;

-- The sole public order-write path. Coupon capacity is reserved atomically with
-- SELECT ... FOR UPDATE and the usage increment rolls back if order insertion fails.
create or replace function public.submit_order(
  p_customer_name text,
  p_phone text,
  p_delivery_method text,
  p_metro_station text,
  p_notes text,
  p_items jsonb,
  p_coupon_code text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $function$
declare
  v_coupon public.coupons%rowtype;
  v_coupon_code text;
  v_coupon_percent numeric(5,2) := 0;
  v_coupon_discount numeric(12,2) := 0;
  v_totals jsonb;
  v_total numeric(12,2);
  v_order_id bigint;
begin
  if p_customer_name is null or length(btrim(p_customer_name)) < 2 or length(p_customer_name) > 120 then
    raise exception using errcode = '22023', message = 'CUSTOMER_NAME_INVALID';
  end if;
  if p_phone is null or btrim(p_phone) !~ '^01[0-9]{9}$' then
    raise exception using errcode = '22023', message = 'PHONE_INVALID';
  end if;
  if p_notes is not null and length(p_notes) > 2000 then
    raise exception using errcode = '22023', message = 'NOTES_TOO_LONG';
  end if;

  v_totals := public._laz2a_order_totals(p_items, p_delivery_method, p_metro_station);

  if p_coupon_code is not null and btrim(p_coupon_code) <> '' then
    select * into v_coupon
    from public.coupons
    where code = upper(btrim(p_coupon_code))
    for update;
    if not found then
      raise exception using errcode = 'P0001', message = 'COUPON_INVALID';
    end if;
    if not v_coupon.active
      or (v_coupon.starts_at is not null and v_coupon.starts_at > now())
      or (v_coupon.expires_at is not null and v_coupon.expires_at <= now())
      or v_coupon.used_count >= v_coupon.max_uses then
      raise exception using errcode = 'P0001', message = 'COUPON_INVALID';
    end if;
    v_coupon_code := v_coupon.code;
    v_coupon_percent := v_coupon.discount_percent;
    v_coupon_discount := round((v_totals->>'amount_before_coupon')::numeric * v_coupon_percent / 100, 2);
    update public.coupons set used_count = used_count + 1 where code = v_coupon.code;
  end if;

  v_total := greatest(0, (v_totals->>'amount_before_coupon')::numeric - v_coupon_discount)
    + (v_totals->>'delivery_fee')::numeric;

  insert into public.orders (
    customer_name, phone, address, total_amount, subtotal_amount,
    promo_discount_amount, coupon_code, coupon_percent, coupon_discount_amount,
    delivery_fee, paid_qty, free_qty, total_qty, items,
    delivery_method, metro_station, notes
  ) values (
    btrim(p_customer_name), btrim(p_phone), '', v_total,
    (v_totals->>'subtotal_amount')::numeric,
    (v_totals->>'promo_discount_amount')::numeric,
    v_coupon_code, nullif(v_coupon_percent, 0), v_coupon_discount,
    (v_totals->>'delivery_fee')::numeric,
    greatest(0, (v_totals->>'total_qty')::integer - (v_totals->>'free_items')::integer),
    (v_totals->>'free_items')::integer,
    (v_totals->>'total_qty')::integer,
    v_totals->'items', p_delivery_method,
    case when p_delivery_method = 'metro_station' then btrim(p_metro_station) else null end,
    nullif(btrim(coalesce(p_notes, '')), '')
  ) returning id into v_order_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'subtotal_amount', (v_totals->>'subtotal_amount')::numeric,
    'promo_discount_amount', (v_totals->>'promo_discount_amount')::numeric,
    'coupon_code', v_coupon_code,
    'coupon_percent', nullif(v_coupon_percent, 0),
    'coupon_discount_amount', v_coupon_discount,
    'delivery_fee', (v_totals->>'delivery_fee')::numeric,
    'total_amount', v_total,
    'free_items', (v_totals->>'free_items')::integer
  );
end;
$function$;

-- Keep internal price calculation private; expose only coupon preview and final checkout.
revoke all on function public._laz2a_order_totals(jsonb, text, text) from public, anon, authenticated;
revoke all on function public.preview_coupon(text, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.preview_coupon(text, jsonb, text, text) to anon, authenticated;
revoke all on function public.submit_order(text, text, text, text, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.submit_order(text, text, text, text, text, jsonb, text) to anon, authenticated;

-- To authorize an administrator, create the user in Supabase Auth, then run
-- this query in the SQL Editor with their email address:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'ADMIN_EMAIL@example.com'
-- on conflict (user_id) do nothing;
--
-- To create a 15% coupon with at most 100 successful orders:
-- insert into public.coupons (code, discount_percent, max_uses)
-- values ('LAZ2A15', 15, 100);
-- Optional start/expiry timestamps can be supplied in starts_at/expires_at.
-- Never put a service-role key, database password, or coupon management credential in frontend code.
