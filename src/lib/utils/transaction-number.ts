import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Membuat nomor transaksi dengan format: BK-YYYYMMDD-XXXX
 * di mana XXXX adalah counter 4 digit per user per hari.
 *
 * Contoh: jika user sudah punya 3 transaksi hari ini,
 * nomor berikutnya adalah "BK-20260530-0004".
 *
 * Edge case: bila query gagal, fallback ke counter berbasis timestamp acak
 * agar nomor tetap unik dan operasi tidak gagal total.
 */
export async function generateTransactionNumber(
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<string> {
  const now = new Date();
  const datePart = formatDatePart(now);

  try {
    // Rentang hari ini (waktu lokal) -> ISO untuk dibandingkan dengan transaction_date.
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const { count, error } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("transaction_date", startOfDay.toISOString())
      .lte("transaction_date", endOfDay.toISOString());

    if (error) throw error;

    const next = (count ?? 0) + 1;
    const counter = String(next).padStart(4, "0");
    return `BK-${datePart}-${counter}`;
  } catch {
    // Fallback: 4 digit dari timestamp agar tetap unik bila counter gagal dihitung.
    const fallback = String(Date.now() % 10000).padStart(4, "0");
    return `BK-${datePart}-${fallback}`;
  }
}

function formatDatePart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}
