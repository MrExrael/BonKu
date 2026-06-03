-- =============================================================================
-- BonKu — Row Level Security (RLS) Policies
-- Jalankan SETELAH schema.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Aktifkan RLS di semua tabel.
-- -----------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.products            enable row level security;
alter table public.recipients          enable row level security;
alter table public.transactions        enable row level security;
alter table public.transaction_items   enable row level security;

-- -----------------------------------------------------------------------------
-- profiles: user hanya bisa membaca & mengubah profilnya sendiri.
-- (INSERT ditangani oleh trigger handle_new_user dengan security definer.)
-- -----------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- products: full akses (ALL) hanya untuk baris milik user.
-- -----------------------------------------------------------------------------
drop policy if exists "products_all_own" on public.products;
create policy "products_all_own"
  on public.products
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- recipients: full akses (ALL) hanya untuk baris milik user.
-- -----------------------------------------------------------------------------
drop policy if exists "recipients_all_own" on public.recipients;
create policy "recipients_all_own"
  on public.recipients
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- transactions: full akses (ALL) hanya untuk baris milik user.
-- -----------------------------------------------------------------------------
drop policy if exists "transactions_all_own" on public.transactions;
create policy "transactions_all_own"
  on public.transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- transaction_items: full akses (ALL) hanya untuk baris milik user.
-- -----------------------------------------------------------------------------
drop policy if exists "transaction_items_all_own" on public.transaction_items;
create policy "transaction_items_all_own"
  on public.transaction_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
