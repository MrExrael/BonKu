import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export type ServiceResult<T> = { data: T | null; error: string | null };

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Terjadi kesalahan tak terduga";
}

/** Ambil profil user yang sedang login. */
export async function getProfile(): Promise<ServiceResult<Profile>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Tidak ada user yang sedang login");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/**
 * Update profil user yang login.
 * Jika email diubah, sinkronkan juga ke Supabase Auth.
 */
export async function updateProfile(data: {
  full_name?: string;
  email?: string;
}): Promise<ServiceResult<Profile>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Tidak ada user yang sedang login");

    // Sinkronkan email ke Auth bila berubah.
    if (data.email && data.email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: data.email,
      });
      if (authError) throw authError;
    }

    const { data: updated, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;

    return { data: updated, error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}

/**
 * Ganti password: verifikasi password lama dengan re-authenticate,
 * lalu set password baru via Supabase Auth.
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<ServiceResult<boolean>> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user?.email) throw new Error("Tidak ada user yang sedang login");

    // Verifikasi password lama.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });
    if (signInError) throw new Error("Password lama salah");

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError) throw updateError;

    return { data: true, error: null };
  } catch (err) {
    return { data: null, error: errorMessage(err) };
  }
}
