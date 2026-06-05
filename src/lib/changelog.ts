/**
 * Versi aplikasi & riwayat perubahan (changelog).
 * Tambahkan entri baru di PALING ATAS array `CHANGELOG`, lalu naikkan
 * `APP_VERSION` agar popup "Apa yang baru?" muncul otomatis untuk user.
 */
export const APP_VERSION = "1.5.0";

export interface Release {
  version: string;
  date: string; // format bebas, mis. "5 Jun 2026"
  changes: string[];
}

export const CHANGELOG: Release[] = [
  {
    version: "1.5.0",
    date: "5 Jun 2026",
    changes: [
      "Pemberitahuan update: popup \"Apa yang baru?\" + riwayat versi.",
      "Menu Sampah dipindah ke Settings (tab Sampah), tidak lagi di sidebar.",
    ],
  },
  {
    version: "1.4.0",
    date: "1 Jun 2026",
    changes: [
      "Kirim bon ke WhatsApp sebagai JPG atau PDF langsung dari dialog bon.",
    ],
  },
  {
    version: "1.3.0",
    date: "31 Mei 2026",
    changes: [
      "Fitur Sampah: transaksi yang dihapus bisa dipulihkan.",
      "Sampah terhapus otomatis setelah 30 hari.",
      "Status \"Hutang\" + tab Hutang di History untuk transaksi minus.",
    ],
  },
  {
    version: "1.2.0",
    date: "31 Mei 2026",
    changes: [
      "PPN: bisa diaktifkan & disetel persennya di Settings.",
      "Satuan barang bisa dipilih: Kg / Qty / Jumlah.",
      "Nama penerima bisa disimpan & dicari (autocomplete + tombol +).",
      "Tampilan \"LUNAS\" dan \"Sisa Hutang\" pada ringkasan & bon.",
      "Tukar posisi kolom Kg dan Harga, tambah Total Kg.",
    ],
  },
  {
    version: "1.1.0",
    date: "30 Mei 2026",
    changes: [
      "Status pembayaran: Lunas / Belum Lunas + filter di History.",
      "Nama perusahaan pada bon (bisa diubah di Settings).",
      "Pilihan ukuran ekspor bon: Ukuran sekarang / A5 / A6.",
      "Bayar & Sisa di bawah Grand Total.",
      "Draf transaksi tersimpan otomatis (tidak hilang saat pindah/refresh).",
    ],
  },
  {
    version: "1.0.0",
    date: "30 Mei 2026",
    changes: [
      "Rilis awal BonKu.",
      "Menghitung: tabel barang dinamis + ringkasan otomatis.",
      "Bon: cetak, export PDF / PNG / JPG.",
      "History transaksi, Dashboard (KPI + grafik), Kelola Barang.",
      "Login / daftar akun, dark mode.",
    ],
  },
];
