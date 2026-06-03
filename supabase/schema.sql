-- =============================================================================
-- BonKu — Database Schema
-- Jalankan di Supabase SQL Editor. RLS policies ada di file rls.sql (terpisah).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabel: profiles
-- Profil user, terhubung 1:1 dengan auth.users.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  email        text,
  company_name text,
  unit_label   text not null default 'Kg',
  ppn_enabled  boolean not null default false,
  ppn_percent  numeric(5, 2) not null default 11,
  created_at   timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Tabel: products
-- Master daftar produk milik tiap user.
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz default now()
);

create index if not exists idx_products_user_id on public.products (user_id);

-- -----------------------------------------------------------------------------
-- Tabel: recipients
-- Master daftar nama penerima milik tiap user (untuk autocomplete + simpan).
-- -----------------------------------------------------------------------------
create table if not exists public.recipients (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz default now()
);

create index if not exists idx_recipients_user_id on public.recipients (user_id);

-- -----------------------------------------------------------------------------
-- Tabel: transactions
-- Header transaksi / bon.
-- -----------------------------------------------------------------------------
create table if not exists public.transactions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  transaction_number text not null unique,
  recipient_name     text not null,
  phone              text,
  notes              text,
  subtotal           numeric(15, 2) not null default 0,
  ppn_percent        numeric(5, 2) not null default 0,
  ppn_amount         numeric(15, 2) not null default 0,
  debt               numeric(15, 2) not null default 0,
  debt_label         text not null default 'Hutang',
  paid               numeric(15, 2) not null default 0,
  grand_total        numeric(15, 2) not null default 0,
  payment_status     text not null default 'lunas',
  transaction_date   timestamptz not null default now(),
  created_at         timestamptz default now()
);

create index if not exists idx_transactions_user_id on public.transactions (user_id);
create index if not exists idx_transactions_date on public.transactions (transaction_date);

-- -----------------------------------------------------------------------------
-- Tabel: transaction_items
-- Detail item per transaksi.
-- -----------------------------------------------------------------------------
create table if not exists public.transaction_items (
  id             uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  product_name   text not null,
  price          numeric(15, 2) not null default 0,
  weight_kg      numeric(10, 3) not null default 0,
  total          numeric(15, 2) not null default 0,
  created_at     timestamptz default now()
);

create index if not exists idx_transaction_items_transaction_id on public.transaction_items (transaction_id);
create index if not exists idx_transaction_items_user_id on public.transaction_items (user_id);

-- -----------------------------------------------------------------------------
-- Trigger: auto-create profile saat user baru register di auth.users.
-- Mengambil full_name dari raw_user_meta_data dan email dari NEW.email.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, company_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'company_name', 'Grosir barang')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
