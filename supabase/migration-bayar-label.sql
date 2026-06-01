-- =============================================================================
-- Migrasi: tambah debt_label (jenis: Hutang/DP/Panjar/Pinjaman) + paid (Bayar)
-- Jalankan SEKALI di Supabase SQL Editor. Aman diulang (idempotent).
-- =============================================================================

alter table public.transactions
  add column if not exists debt_label text not null default 'Hutang';

alter table public.transactions
  add column if not exists paid numeric(15, 2) not null default 0;
