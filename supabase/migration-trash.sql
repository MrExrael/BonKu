-- =============================================================================
-- Migrasi: soft delete (Sampah) untuk transaksi.
--  - transactions.deleted_at: NULL = aktif, berisi waktu = ada di Sampah.
-- Jalankan SEKALI di Supabase SQL Editor. Aman diulang (idempotent).
-- =============================================================================

alter table public.transactions
  add column if not exists deleted_at timestamptz;

create index if not exists idx_transactions_deleted_at
  on public.transactions (deleted_at);
