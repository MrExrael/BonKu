"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { getTransactions } from "@/lib/services/transactions";
import type { TransactionWithItems } from "@/lib/services/transactions";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  FilterBar,
  type HistoryFilters,
  type StatusFilter,
} from "@/components/history/FilterBar";
import { TransactionsTable } from "@/components/history/TransactionsTable";

function HistoryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = React.useMemo<HistoryFilters>(
    () => ({
      search: searchParams.get("search") ?? "",
      dateFrom: searchParams.get("from") ?? "",
      dateTo: searchParams.get("to") ?? "",
      recipientName: searchParams.get("recipient") ?? "",
      status: (searchParams.get("status") as StatusFilter) ?? "",
    }),
    [searchParams]
  );

  const [data, setData] = React.useState<TransactionWithItems[]>([]);
  const [recipients, setRecipients] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Daftar penerima unik (dari seluruh transaksi, sekali saat mount).
  const loadRecipients = React.useCallback(async () => {
    const { data: all } = await getTransactions();
    if (all) {
      setRecipients(
        Array.from(new Set(all.map((t) => t.recipient_name))).sort()
      );
    }
  }, []);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const { data: result, error } = await getTransactions({
      search: filters.search || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      recipientName: filters.recipientName || undefined,
      status: filters.status || undefined,
    });
    setData(error || !result ? [] : result);
    setLoading(false);
  }, [filters]);

  React.useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  function handleFilterChange(next: HistoryFilters) {
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.dateFrom) params.set("from", next.dateFrom);
    if (next.dateTo) params.set("to", next.dateTo);
    if (next.recipientName) params.set("recipient", next.recipientName);
    if (next.status) params.set("status", next.status);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground">
            Daftar semua transaksi yang tersimpan.
          </p>
        </div>
        <Link
          href="/calculate"
          className={cn(buttonVariants(), "hidden sm:inline-flex")}
        >
          <Plus className="size-4" />
          Transaksi Baru
        </Link>
      </div>

      <Tabs
        value={filters.status || "all"}
        onValueChange={(value) =>
          handleFilterChange({
            ...filters,
            status: value === "all" ? "" : (value as StatusFilter),
          })
        }
      >
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="lunas">Lunas</TabsTrigger>
          <TabsTrigger value="belum_lunas">Belum Lunas</TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar
        filters={filters}
        recipients={recipients}
        onChange={handleFilterChange}
      />

      <TransactionsTable
        data={data}
        loading={loading}
        onChanged={() => {
          loadData();
          loadRecipients();
        }}
      />

      {/* Floating button (mobile) */}
      <Link
        href="/calculate"
        aria-label="Transaksi Baru"
        className={cn(
          buttonVariants({ size: "icon-lg" }),
          "fixed bottom-20 right-4 z-20 size-14 rounded-full shadow-lg sm:hidden"
        )}
      >
        <Plus className="size-6" />
      </Link>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <React.Suspense fallback={null}>
      <HistoryContent />
    </React.Suspense>
  );
}
