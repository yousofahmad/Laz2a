-- Run this in the Supabase SQL editor for the Laz2a project.
-- Public checkout uses only the publishable/anon key and an INSERT policy.
-- Admin reads are restricted to user IDs explicitly listed in admin_users.

create table if not exists public.orders (
  id             bigserial primary key,
  created_at     timestamptz not null default now(),
  customer_name  text        not null,
  phone          text        not null,
  address        text        not null default '',
  total_amount   numeric     not null,
  paid_qty       integer,
  free_qty       integer,
  total_qty      integer,
  items          jsonb       not null default '[]'::jsonb,
  delivery_method text       not null default 'obour_institutes',
  metro_station   text,
  notes          text
);

-- Keep existing installations compatible with the checkout payload.
alter table public.orders add column if not exists delivery_method text not null default 'obour_institutes';
alter table public.orders alter column delivery_method set default 'obour_institutes';
alter table public.orders add column if not exists metro_station text;
alter table public.orders add column if not exists notes text;

alter table public.orders enable row level security;

-- Anyone can submit an order, but no public SELECT/UPDATE/DELETE policy is created.
drop policy if exists "Allow anon inserts" on public.orders;
create policy "Allow anon inserts"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

-- A small allowlist table. Membership is managed only by the project owner
-- through the Supabase SQL editor or a trusted server using the service role.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
grant select on public.admin_users to authenticated;

drop policy if exists "Admins can read their own membership" on public.admin_users;
create policy "Admins can read their own membership"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Remove the broad optional policy from older versions, if it was enabled.
drop policy if exists "Allow authenticated reads" on public.orders;
drop policy if exists "Only listed admins can read orders" on public.orders;
create policy "Only listed admins can read orders"
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

-- To authorize an administrator, first create that person in Supabase Auth,
-- then run this query with their email address in the SQL editor:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'ADMIN_EMAIL@example.com'
-- on conflict (user_id) do nothing;
--
-- Never add a SELECT policy for anon, and never put a service-role key or a
-- database password in frontend variables or browser code.
