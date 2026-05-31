"use client";

import * as React from "react";
import {
  CalendarDays,
  CalendarRange,
  Package,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { formatRupiah } from "@/lib/utils/format";
import type { TransactionWithItems } from "@/lib/services/transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KPICardsProps {
  transactions: TransactionWithItems[];
  loading?: boolean;
}

function isSameDay(date: Date, ref: Date): boolean {
  return (
    date.getFullYear() === ref.getFullYear() &&
    date.getMonth() === ref.getMonth() &&
    date.getDate() === ref.getDate()
  );
}

function isSameMonth(date: Date, ref: Date): boolean {
  return (
    date.getFullYear() === ref.getFullYear() &&
    date.getMonth() === ref.getMonth()
  );
}

export function KPICards({ transactions, loading }: KPICardsProps) {
  const stats = React.useMemo(() => {
    const now = new Date();
    let todayCount = 0;
    let monthCount = 0;
    let monthIncome = 0;
    let monthSubtotal = 0;
    const productNames = new Set<string>();

    for (const tx of transactions) {
      const date = new Date(tx.transaction_date);
      if (isSameDay(date, now)) todayCount++;
      if (isSameMonth(date, now)) {
        monthCount++;
        monthIncome += tx.grand_total;
        monthSubtotal += tx.subtotal;
      }
      for (const item of tx.transaction_items ?? []) {
        if (item.product_name) productNames.add(item.product_name.trim());
      }
    }

    return {
      todayCount,
      monthCount,
      monthIncome,
      monthSubtotal,
      totalCount: transactions.length,
      productKinds: productNames.size,
    };
  }, [transactions]);

  const cards = [
    {
      label: "Transaksi Hari Ini",
      value: String(stats.todayCount),
      icon: CalendarDays,
    },
    {
      label: "Transaksi Bulan Ini",
      value: String(stats.monthCount),
      icon: CalendarRange,
    },
    {
      label: "Pemasukan Bulan Ini",
      value: formatRupiah(stats.monthIncome),
      icon: TrendingUp,
    },
    {
      label: "Total Nilai Bulan Ini",
      value: formatRupiah(stats.monthSubtotal),
      icon: Wallet,
    },
    {
      label: "Total Transaksi",
      value: String(stats.totalCount),
      icon: Receipt,
    },
    {
      label: "Jenis Barang",
      value: String(stats.productKinds),
      icon: Package,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {cards.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="flex items-start justify-between gap-2 pt-6">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 truncate text-xl font-bold tracking-tight">
                {value}
              </p>
            </div>
            <span className="rounded-lg bg-muted p-2 text-muted-foreground">
              <Icon className="size-4" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default KPICards;
