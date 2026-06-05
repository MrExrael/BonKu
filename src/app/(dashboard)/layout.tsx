import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Sidebar, type SidebarUser } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { WhatsNew } from "@/components/layout/WhatsNew";

/**
 * Layout area dashboard.
 * - Memvalidasi session: jika tidak ada user, redirect ke /login.
 * - Sidebar tampil di md: ke atas, BottomNav di bawah md:.
 * - Toaster global sudah dipasang di root layout (tidak diduplikasi di sini).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ambil nama dari tabel profiles (fallback ke metadata / email).
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const sidebarUser: SidebarUser = {
    name:
      profile?.full_name ||
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "Pengguna",
    email: profile?.email || user.email || "",
  };

  return (
    <div className="min-h-full">
      <Sidebar user={sidebarUser} />
      <div className="md:pl-60">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
      <WhatsNew />
    </div>
  );
}
