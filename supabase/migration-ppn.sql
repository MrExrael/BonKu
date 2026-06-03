-- =============================================================================
-- Migrasi: fitur PPN.
--  - profiles: ppn_enabled (aktif/nonaktif) + ppn_percent (persen default)
--  - transactions: ppn_percent + ppn_amount (disimpan per transaksi)
-- Jalankan SEKALI di Supabase SQL Editor. Aman diulang (idempotent).
-- =============================================================================

alter table public.profiles
  add column if not exists ppn_enabled boolean not null default false;

alter table public.profiles
  add column if not exists ppn_percent numeric(5, 2) not null default 11;

alter table public.transactions
  add column if not exists ppn_percent numeric(5, 2) not null default 0;

alter table public.transactions
  add column if not exists ppn_amount numeric(15, 2) not null default 0;
