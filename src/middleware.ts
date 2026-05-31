import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Daftar route.
 * - PROTECTED: butuh login. Jika belum login → redirect ke /login.
 * - AUTH (public): /login & /register. Jika sudah login → redirect ke /dashboard.
 * - Sisanya (mis. /forgot-password, /reset-password, /) bebas diakses.
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/calculate",
  "/history",
  "/settings",
  "/profile",
];
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  // Refresh session + sinkronisasi cookie. WAJIB tetap memakai response ini.
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Belum login tapi akses route terproteksi → /login.
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Sudah login tapi akses /login atau /register → /dashboard.
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path kecuali:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico
     * - file gambar umum (svg, png, jpg, dst.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
