import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/database";

export type ServiceResult<T> = { data: T | null; error: string | null };

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Terjadi kesalahan tak terduga";
}

/** Ambil semua produk milik user yang login. */
export async function getProducts(): Promise<ServiceResult<Product[]>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Tidak ada user yang sedang login");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });
    if (error) throw error;

    return { data: data ?? [], error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/** Buat produk baru. */
export async function createProduct(
  name: string
): Promise<ServiceResult<Product>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Tidak ada user yang sedang login");

    const { data, error } = await supabase
      .from("products")
      .insert({ name: name.trim(), user_id: user.id })
      .select()
      .single();
    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/** Ubah nama produk. */
export async function updateProduct(
  id: string,
  name: string
): Promise<ServiceResult<Product>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .update({ name: name.trim() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/** Hapus produk. */
export async function deleteProduct(
  id: string
): Promise<ServiceResult<boolean>> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}
