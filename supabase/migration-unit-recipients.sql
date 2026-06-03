-- =============================================================================
-- Migrasi: satuan (unit_label) di profiles + tabel recipients (nama penerima)
-- Jalankan SEKALI di Supabase SQL Editor. Aman diulang (idempotent).
-- =============================================================================

-- Satuan tampilan kolom kuantitas: 'Kg' | 'Qty' | 'Jumlah'
alter table public.profiles
  add column if not exists unit_label text not null default 'Kg';

-- Master nama penerima per user (untuk autocomplete + tombol "+").
create table if not exists public.recipients (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz default now()
);

create index if not exists idx_recipients_user_id on public.recipients (user_id);

alter table public.recipients enable row level security;

drop policy if exists "recipients_all_own" on public.recipients;
create policy "recipients_all_own"
  on public.recipients
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
