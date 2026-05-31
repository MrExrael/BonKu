import { redirect } from "next/navigation";

/**
 * Halaman root: arahkan ke dashboard. Middleware akan otomatis mengalihkan
 * ke /login jika user belum terautentikasi.
 */
export default function Home() {
  redirect("/dashboard");
}
