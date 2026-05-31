"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { getTransactions } from "@/lib/services/transactions";
import type { TransactionWithItems } from "@/lib/services/transactions";
import { getProfile } from "@/lib/services/profiles";
import { Button } from "@/components/ui/button";
import { KPICards } from "@/components/dashboard/KPICards";
import { Charts } from "@/components/dashboard/Charts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export default function DashboardPage() {
  const [transactions, setTransactions] = React.useState<
    TransactionWithItems[]
  >([]);
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    // Fetch paralel: transaksi + profil.
    const [txRes, profileRes] = await Promise.all([
      getTransactions(),
      getProfile(),
    ]);

    if (txRes.error) {
      setError(txRes.error);
      setTransactions([]);
    } else {
      setTransactions(txRes.data ?? []);
    }
    if (profileRes.data) {
      setName(profileRes.data.full_name || profileRes.data.email || "");
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting()}
          {name ? `, ${name}` : ""}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan aktivitas dan performa usaha Anda.
        </p>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-8 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <div>
            <p className="font-medium">Gagal memuat data dashboard</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" onClick={load}>
            Coba Lagi
          </Button>
        </div>
      ) : !loading && transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <span className="rounded-full bg-muted p-4 text-muted-foreground">
            <Plus className="size-8" />
          </span>
          <h3 className="font-medium">Selamat datang di BonKu!</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Belum ada data untuk ditampilkan. Buat transaksi pertama Anda dan
            ringkasan akan muncul di sini.
          </p>
          <Link href="/calculate" className={cn(buttonVariants(), "mt-1")}>
            <Plus className="size-4" />
            Buat Transaksi Pertama
          </Link>
        </div>
      ) : (
        <>
          <KPICards transactions={transactions} loading={loading} />
          <Charts transactions={transactions} loading={loading} />
          <RecentActivity transactions={transactions} loading={loading} />
        </>
      )}
    </div>
  );
}
