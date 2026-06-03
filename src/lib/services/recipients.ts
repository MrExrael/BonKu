import { createClient } from "@/lib/supabase/client";
import type { Recipient } from "@/types/database";

export type ServiceResult<T> = { data: T | null; error: string | null };

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Terjadi kesalahan tak terduga";
}

/** Ambil semua nama penerima tersimpan milik user yang login. */
export async function getRecipients(): Promise<ServiceResult<Recipient[]>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Tidak ada user yang sedang login");

    const { data, error } = await supabase
      .from("recipients")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });
    if (error) throw error;

    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/** Simpan nama penerima baru. Mengabaikan jika sudah ada (case-insensitive). */
export async function createRecipient(
  name: string
): Promise<ServiceResult<Recipient | null>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Tidak ada user yang sedang login");

    const trimmed = name.trim();
    if (!trimmed) throw new Error("Nama penerima tidak boleh kosong");

    // Cegah duplikat (case-insensitive).
    const { data: existing } = await supabase
      .from("recipients")
      .select("id")
      .eq("user_id", user.id)
      .ilike("name", trimmed)
      .maybeSingle();
    if (existing) return { data: null, error: null };

    const { data, error } = await supabase
      .from("recipients")
      .insert({ name: trimmed, user_id: user.id })
      .select()
      .single();
    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}
