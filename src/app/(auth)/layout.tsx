import Link from "next/link";

/**
 * Layout untuk halaman autentikasi.
 * Konten dipusatkan di atas background subtle, dengan logo BonKu di atas kartu.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Background subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 via-background to-background"
      />

      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight font-heading"
          >
            BonKu
          </Link>
          <p className="text-sm text-muted-foreground">
            Pembukuan praktis untuk UMKM
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
