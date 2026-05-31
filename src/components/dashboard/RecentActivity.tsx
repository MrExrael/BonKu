"use client";

import * as React from "react";
import Link from "next/link";
import { Receipt } from "lucide-react";

import { formatDate, formatRupiah } from "@/lib/utils/format";
import type { TransactionWithItems } from "@/lib/services/transactions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { BonTemplate } from "@/components/bon/BonTemplate";
import { ExportButtons } from "@/components/bon/ExportButtons";

interface RecentActivityProps {
  transactions: TransactionWithItems[];
  loading?: boolean;
}

function byCreatedAtDesc(a: TransactionWithItems, b: TransactionWithItems) {
  return (
    new Date(b.created_at ?? b.transaction_date).getTime() -
    new Date(a.created_at ?? a.transaction_date).getTime()
  );
}

export function RecentActivity({ transactions, loading }: RecentActivityProps) {
  const [detail, setDetail] = React.useState<TransactionWithItems | null>(null);

  const recent = React.useMemo(
    () => [...transactions].sort(byCreatedAtDesc).slice(0, 5),
    [transactions]
  );

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Aktivitas Terbaru */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          <Link
            href="/history"
            className="text-sm font-medium text-primary hover:underline"
          >
            Lihat semua
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada aktivitas.
            </p>
          ) : (
            <ul className="space-y-3">
              {recent.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3">
                  <span className="rounded-md bg-muted p-2 text-muted-foreground">
                    <Receipt className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      Transaksi {tx.transaction_number} dibuat
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.created_at ?? tx.transaction_date)} •{" "}
                      {tx.recipient_name}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {formatRupiah(tx.grand_total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Transaksi Terbaru */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
          <Link
            href="/history"
            className="text-sm font-medium text-primary hover:underline"
          >
            Lihat semua
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada transaksi.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="cursor-pointer"
                    onClick={() => setDetail(tx)}
                  >
                    <TableCell className="font-medium">
                      {tx.transaction_number}
                    </TableCell>
                    <TableCell>{tx.recipient_name}</TableCell>
                    <TableCell>{formatDate(tx.transaction_date)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatRupiah(tx.grand_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail modal */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>{detail?.transaction_number}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex justify-center overflow-x-auto rounded-lg border bg-white p-3">
                <BonTemplate transaction={detail} />
              </div>
              <ExportButtons transactionNumber={detail.transaction_number} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RecentActivity;
