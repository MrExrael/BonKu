# BonKu

Aplikasi pencatatan & pembukuan praktis untuk UMKM — hitung belanja, simpan
transaksi, cetak/ekspor bon, dan pantau ringkasan usaha. Dibangun dengan
Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, dan Supabase.

## Fitur

- 🔐 Autentikasi (login, register, lupa/reset password) via Supabase Auth
- 🧮 Halaman **Menghitung**: tabel barang dinamis, kalkulasi otomatis (harga × kg)
- 🧾 **Bon/Nota**: cetak (print), ekspor PDF / PNG / JPG
- 📜 **History** transaksi: TanStack Table, filter, sortir, paginasi, edit, hapus
- 📊 **Dashboard**: KPI cards, grafik bar & line (Recharts), aktivitas terbaru
- ⚙️ **Settings**: kelola barang + backup/restore data (JSON)
- 👤 **Profil**: edit nama, ganti password, logout
- 🌗 Dark mode (next-themes), responsif (mobile/tablet/desktop)

## Tech Stack

Next.js 15 · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui
(base-nova) · Supabase (`@supabase/ssr`) · React Hook Form + Zod ·
TanStack Table · Recharts · jsPDF + html2canvas · sonner

---

## 1. Clone & Install

```bash
git clone <repo-url> bonku
cd bonku
npm install
```

## 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan isi file berikut secara berurutan:
   - [`supabase/schema.sql`](supabase/schema.sql) — tabel, index, trigger profil
   - [`supabase/rls.sql`](supabase/rls.sql) — Row Level Security + policies
3. Buka **Authentication → Providers → Email** dan aktifkan **Email** auth.
4. Buka **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (saat dev) / domain produksi Anda.
   - **Redirect URLs**: tambahkan `http://localhost:3000/reset-password`
     dan `http://localhost:3000/login` (serta versi domain produksi).
5. Ambil **Project URL** dan **anon public key** dari **Project Settings → API**.

### ✅ Checklist Supabase

- [ ] Tabel `profiles`, `products`, `transactions`, `transaction_items` sudah dibuat
- [ ] Trigger `handle_new_user` (auto-create profil) sudah aktif
- [ ] RLS sudah diaktifkan di **semua** tabel + policies terpasang
- [ ] Email Auth sudah diaktifkan di Supabase Dashboard
- [ ] Site URL & Redirect URLs (termasuk `/reset-password`) sudah dikonfigurasi

## 3. Environment Variables

Salin `.env.example` menjadi `.env.local` lalu isi nilainya:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Daftar akun baru, cek email
untuk verifikasi, lalu login.

## 5. Build Produksi

```bash
npm run build
npm start
```

## 6. Deploy ke Vercel

1. Push repo ke GitHub/GitLab/Bitbucket.
2. Di [vercel.com](https://vercel.com), **Import Project** dari repo tersebut.
3. Tambahkan Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) di **Settings → Environment Variables**.
4. Deploy. Setelah dapat domain produksi, perbarui **Site URL** & **Redirect
   URLs** di Supabase agar sesuai domain Vercel.

---

## Struktur Proyek

```
src/
  app/
    (auth)/        # login, register, forgot/reset password
    (dashboard)/   # dashboard, calculate, history, settings, profile
  components/
    ui/            # shadcn/ui
    auth/ calculate/ bon/ history/ dashboard/ settings/ layout/
  lib/
    supabase/      # client, server, middleware
    services/      # transactions, products, profiles (CRUD)
    utils/         # format, transaction-number, export
    validations/   # zod schemas (auth, transaction)
  types/           # database types (Supabase)
  middleware.ts    # route protection
supabase/
  schema.sql  rls.sql
```

## Catatan

- **Ekspor bon** memakai html2canvas; `BonTemplate` sengaja memakai warna hex
  eksplisit (bukan token tema `oklch`) agar capture PDF/PNG/JPG bekerja.
- **Restore** menambahkan data ke akun (nomor transaksi dibuat ulang), bukan
  menimpa data yang ada.
