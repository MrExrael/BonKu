-- =============================================================================
-- Migrasi: tambah payment_status (transactions) + company_name (profiles)
-- Jalankan SEKALI di Supabase SQL Editor untuk database yang sudah ada.
-- Aman diulang (idempotent).
-- =============================================================================

-- Status pembayaran transaksi: 'lunas' | 'belum_lunas'
alter table public.transactions
  add column if not exists payment_status text not null default 'lunas';

-- Nama perusahaan per user
alter table public.profiles
  add column if not exists company_name text;

-- Isi default untuk user yang sudah ada tapi belum punya nama perusahaan
update public.profiles
  set company_name = 'Grosir barang'
  where company_name is null;

-- Perbarui trigger agar user baru otomatis dapat company_name default
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
