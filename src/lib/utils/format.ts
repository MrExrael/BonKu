/**
 * Format angka menjadi mata uang Rupiah tanpa desimal.
 * Contoh: 80000 -> "Rp 80.000"
 */
export function formatRupiah(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  // Normalisasi semua whitespace (termasuk non-breaking space) ke spasi biasa.
  return formatted.replace(/\s/g, " ");
}

/**
 * Format angka dengan pemisah ribuan ala Indonesia, tanpa simbol mata uang.
 * Contoh: 80000 -> "80.000". Mendukung desimal (mis. berat kg).
 */
export function formatNumber(amount: number, maxFractionDigits = 0): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

/**
 * Format tanggal menjadi "DD MMM YYYY" dengan locale Indonesia.
 * Contoh: "2026-05-30" -> "30 Mei 2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format jam:menit dengan locale Indonesia. Contoh: "22.07".
 */
export function formatTime(date: string | Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format tanggal untuk nilai input[type="date"] -> "YYYY-MM-DD".
 * Menggunakan komponen tanggal lokal (bukan UTC) agar tidak bergeser hari.
 */
export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
