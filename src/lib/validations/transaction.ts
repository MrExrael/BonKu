import { z } from "zod";

/** Tanggal hari ini dalam format "YYYY-MM-DD" (waktu lokal) untuk nilai default. */
function todayInput(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Schema satu item transaksi.
 * total bersifat auto-calculated (price * weight_kg) namun tetap divalidasi.
 */
export const transactionItemSchema = z.object({
  product_name: z.string().trim().min(1, "Nama produk wajib diisi"),
  price: z
    .number({ message: "Harga harus berupa angka" })
    .min(0, "Harga tidak boleh negatif"),
  weight_kg: z
    .number({ message: "Berat harus berupa angka" })
    .min(0.001, "Berat minimal 0.001 kg"),
  total: z
    .number({ message: "Total harus berupa angka" })
    .min(0, "Total tidak boleh negatif"),
});

/**
 * Schema transaksi lengkap.
 * Validasi custom: subtotal - debt tidak boleh negatif.
 */
export const transactionSchema = z
  .object({
    items: z
      .array(transactionItemSchema)
      .min(1, "Minimal 1 item transaksi"),
    recipient_name: z.string().trim().min(1, "Nama penerima wajib diisi"),
    phone: z.string().trim().optional(),
    notes: z
      .string()
      .max(500, "Catatan maksimal 500 karakter")
      .optional(),
    transaction_date: z
      .string()
      .min(1, "Tanggal transaksi wajib diisi")
      .default(todayInput()),
    subtotal: z
      .number({ message: "Subtotal harus berupa angka" })
      .min(0, "Subtotal tidak boleh negatif"),
    debt: z
      .number({ message: "Hutang harus berupa angka" })
      .min(0, "Hutang tidak boleh negatif")
      .default(0),
    grand_total: z
      .number({ message: "Grand total harus berupa angka" })
      .min(0, "Grand total harus >= 0"),
    payment_status: z.enum(["lunas", "belum_lunas"]).default("lunas"),
  })
  .refine((data) => data.subtotal - data.debt >= 0, {
    message: "Subtotal dikurangi hutang tidak boleh negatif",
    path: ["debt"],
  });

/**
 * Schema khusus form penerima (sub-form di halaman menghitung).
 */
export const recipientSchema = z.object({
  recipient_name: z.string().trim().min(1, "Nama penerima wajib diisi"),
  phone: z.string().trim().optional(),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
  // Default tanggal diisi dari form (defaultValues), bukan di schema, agar tipe
  // input & output konsisten untuk react-hook-form resolver.
  transaction_date: z.string().min(1, "Tanggal transaksi wajib diisi"),
});

export type TransactionItemInput = z.infer<typeof transactionItemSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type RecipientInput = z.infer<typeof recipientSchema>;
