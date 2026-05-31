import { createClient } from "@/lib/supabase/client";
import { generateTransactionNumber } from "@/lib/utils/transaction-number";
import type {
  Transaction,
  TransactionItem,
  TransactionInsert,
  TransactionUpdate,
  TransactionItemInsert,
} from "@/types/database";

export type ServiceResult<T> = { data: T | null; error: string | null };

export type TransactionWithItems = Transaction & {
  transaction_items: TransactionItem[];
};

export interface TransactionFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  recipientName?: string;
}

/** Input pembuatan transaksi: header tanpa user_id & transaction_number (auto), plus items. */
export type CreateTransactionInput = Omit<
  TransactionInsert,
  "user_id" | "transaction_number"
> & {
  items: Array<Omit<TransactionItemInsert, "user_id" | "transaction_id">>;
};

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Terjadi kesalahan tak terduga";
}

/**
 * Menaikkan counter pada nomor transaksi "BK-YYYYMMDD-XXXX" sebesar `offset`.
 * Dipakai untuk retry saat terjadi konflik nomor (race condition).
 */
function bumpCounter(transactionNumber: string, offset: number): string {
  if (offset === 0) return transactionNumber;
  const parts = transactionNumber.split("-");
  const counter = Number(parts[parts.length - 1]) || 0;
  parts[parts.length - 1] = String(counter + offset).padStart(4, "0");
  return parts.join("-");
}

/**
 * Ambil semua transaksi milik user yang login beserta items-nya.
 * Mendukung filter pencarian, rentang tanggal, dan nama penerima.
 */
export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<ServiceResult<TransactionWithItems[]>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Tidak ada user yang sedang login");

    let query = supabase
      .from("transactions")
      .select("*, transaction_items(*)")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false });

    if (filters.search) {
      query = query.or(
        `transaction_number.ilike.%${filters.search}%,recipient_name.ilike.%${filters.search}%`
      );
    }
    if (filters.recipientName) {
      query = query.ilike("recipient_name", `%${filters.recipientName}%`);
    }
    if (filters.dateFrom) {
      query = query.gte("transaction_date", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("transaction_date", filters.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { data: (data ?? []) as TransactionWithItems[], error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/** Ambil detail satu transaksi beserta items-nya. */
export async function getTransactionById(
  id: string
): Promise<ServiceResult<TransactionWithItems>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*, transaction_items(*)")
      .eq("id", id)
      .single();
    if (error) throw error;

    return { data: data as TransactionWithItems, error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/**
 * Buat transaksi baru: insert header + items.
 * transaction_number digenerate otomatis. Jika insert items gagal,
 * header yang sudah dibuat akan dihapus kembali (best-effort rollback).
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<ServiceResult<TransactionWithItems>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Tidak ada user yang sedang login");

    const { items, ...header } = input;

    // Insert header dengan retry: jika transaction_number bentrok (UNIQUE
    // constraint, kode Postgres 23505) akibat race condition, increment counter
    // dan coba lagi beberapa kali.
    const baseNumber = await generateTransactionNumber(user.id, supabase);
    const MAX_ATTEMPTS = 5;
    let transaction: Transaction | null = null;
    let lastError: { code?: string; message?: string } | null = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const transaction_number = bumpCounter(baseNumber, attempt);
      const { data, error: headerError } = await supabase
        .from("transactions")
        .insert({ ...header, user_id: user.id, transaction_number })
        .select()
        .single();

      if (!headerError) {
        transaction = data;
        break;
      }
      // Hanya retry pada pelanggaran unik; selain itu langsung gagal.
      if (headerError.code === "23505") {
        lastError = headerError;
        continue;
      }
      throw headerError;
    }

    if (!transaction) {
      throw new Error(
        lastError?.message ?? "Gagal membuat nomor transaksi yang unik"
      );
    }

    const itemsPayload = items.map((item) => ({
      ...item,
      transaction_id: transaction.id,
      user_id: user.id,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from("transaction_items")
      .insert(itemsPayload)
      .select();

    if (itemsError) {
      // Rollback best-effort: hapus header agar tidak ada transaksi tanpa item.
      await supabase.from("transactions").delete().eq("id", transaction.id);
      throw itemsError;
    }

    return {
      data: { ...transaction, transaction_items: insertedItems ?? [] },
      error: null,
    };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/** Update field-field transaksi (header). */
export async function updateTransaction(
  id: string,
  data: TransactionUpdate
): Promise<ServiceResult<Transaction>> {
  try {
    const supabase = createClient();
    const { data: updated, error } = await supabase
      .from("transactions")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return { data: updated, error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/**
 * Update transaksi sekaligus mengganti seluruh items-nya (untuk mode edit).
 * Header di-update, items lama dihapus lalu items baru di-insert.
 * transaction_number tidak diubah.
 */
export async function updateTransactionWithItems(
  id: string,
  input: CreateTransactionInput
): Promise<ServiceResult<TransactionWithItems>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Tidak ada user yang sedang login");

    const { items, ...header } = input;

    const { data: transaction, error: headerError } = await supabase
      .from("transactions")
      .update(header)
      .eq("id", id)
      .select()
      .single();
    if (headerError) throw headerError;

    const { error: deleteError } = await supabase
      .from("transaction_items")
      .delete()
      .eq("transaction_id", id);
    if (deleteError) throw deleteError;

    const itemsPayload = items.map((item) => ({
      ...item,
      transaction_id: id,
      user_id: user.id,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from("transaction_items")
      .insert(itemsPayload)
      .select();
    if (itemsError) throw itemsError;

    return {
      data: { ...transaction, transaction_items: insertedItems ?? [] },
      error: null,
    };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/** Hapus transaksi (items ikut terhapus via ON DELETE CASCADE). */
export async function deleteTransaction(
  id: string
): Promise<ServiceResult<boolean>> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;

    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}
