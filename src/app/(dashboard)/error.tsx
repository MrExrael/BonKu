"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Error boundary untuk seluruh area dashboard.
 * Menampilkan pesan informatif + tombol "Coba Lagi" (memanggil reset()).
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertTriangle className="size-8" />
      </span>
      <div>
        <h2 className="text-lg font-semibold">Terjadi kesalahan</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Maaf, terjadi masalah saat memuat halaman ini. Silakan coba lagi.
        </p>
      </div>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}
