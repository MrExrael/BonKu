import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Supabase client untuk Server Components, Server Actions, dan Route Handlers.
 * Di Next.js 15 `cookies()` bersifat async, sehingga fungsi ini async.
 *
 * Catatan: pemanggilan `setAll` dari dalam Server Component akan dibungkus
 * try/catch karena cookie hanya bisa di-set dari Server Action / Route Handler.
 * Middleware bertugas me-refresh session, jadi error ini aman diabaikan.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dipanggil dari Server Component — abaikan, session di-refresh middleware.
          }
        },
      },
    }
  );
}
