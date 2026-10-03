-- Run this in your Supabase SQL editor to create the orders table.
-- Go to: Supabase Dashboard → SQL Editor → New query → paste & run.

create table if not exists public.orders (
  id             bigserial primary key,
  created_at     timestamptz default now() not null,

  -- Customer info
  customer_name  text        not null,
  phone          text        not null,
  address        text        not null,

  -- Financials
  total_amount   numeric     not null,

  -- Promo breakdown (optional but useful for analytics)
  paid_qty       integer,
  free_qty       integer,
  total_qty      integer,

  -- Cart items stored as JSONB array
  -- Each element: { id, name, quantity, price }
  items          jsonb       not null default '[]'::jsonb
);

-- Enable Row Level Security (RLS) — allows anonymous inserts (for checkout),
-- but blocks reads unless you add a policy or use the service_role key.
alter table public.orders enable row level security;

-- Allow anyone (anon) to insert a new order (checkout form)
create policy "Allow anon inserts"
  on public.orders
  for insert
  to anon
  with check (true);

-- Optional: allow authenticated users (e.g. admin) to read all orders
-- create policy "Allow authenticated reads"
--   on public.orders
--   for select
--   to authenticated
--   using (true);
