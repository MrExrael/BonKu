import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Memperbarui (refresh) session Supabase pada setiap request dan menyinkronkan
 * cookie auth antara request dan response.
 *
 * Mengembalikan `supabaseResponse` (NextResponse yang sudah membawa cookie auth
 * terbaru) beserta `user` hasil validasi. Logika redirect/proteksi route
 * ditangani di `src/middleware.ts`.
 */
export async function updateSession(request: NextRequest): Promise<{
  supabaseResponse: NextResponse;
  user: User | null;
}> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // PENTING: jangan menjalankan logika di antara createServerClient dan getUser().
  // getUser() me-refresh token auth; melewatkannya dapat menyebabkan user logout acak.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
