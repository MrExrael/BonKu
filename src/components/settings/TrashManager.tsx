"use client";

import * as React from "react";
import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatDate, formatRupiah } from "@/lib/utils/format";
import {
  getDeletedTransactions,
  permanentDeleteTransaction,
  purgeExpiredTrash,
  restoreTransaction,
  type TransactionWithItems,
} from "@/lib/services/transactions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Daftar transaksi di Sampah + aksi Pulihkan / Hapus Permanen.
 * Membersihkan otomatis sampah yang sudah lewat 30 hari saat dibuka.
 */
export function TrashManager() {
  const [data, setData] = React.useState<TransactionWithItems[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<TransactionWithItems | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    await purgeExpiredTrash(30);
    const { data: result } = await getDeletedTransactions();
    setData(result ?? []);
    setLoading(false);
  }, []);

  function daysLeft(deletedAt: string | null): number {
    if (!deletedAt) return 30;
    const elapsed = (Date.now() - new Date(deletedAt).getTime()) / 86400000;
    return Math.max(0, Math.ceil(30 - elapsed));
  }

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleRestore(tx: TransactionWithItems) {
    setBusyId(tx.id);
    const { error } = await restoreTransaction(tx.id);
    setBusyId(null);
    if (error) {
      toast.error("Gagal memulihkan", { description: error });
      return;
    }
    toast.success("Transaksi dipulihkan", { description: tx.transaction_number });
    load();
  }

  async function confirmPermanentDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await permanentDeleteTransaction(deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error("Gagal menghapus permanen", { description: error });
      return;
    }
    toast.success("Transaksi dihapus permanen");
    setDeleteTarget(null);
    load();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Transaksi yang dihapus disimpan di sini dan akan terhapus permanen
        otomatis setelah 30 hari. Pulihkan sebelum itu jika masih dibutuhkan.
      </p>

      {loading ? (
        <div className="space-y-2 rounded-lg border p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <span className="rounded-full bg-muted p-4 text-muted-foreground">
            <Trash2 className="size-8" />
          </span>
          <h3 className="font-medium">Sampah kosong</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            Transaksi yang Anda hapus dari History akan muncul di sini dan bisa
            dipulihkan.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Transaksi</TableHead>
                <TableHead>Nama Penerima</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Grand Total</TableHead>
                <TableHead className="text-center">Auto-hapus</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">
                    {tx.transaction_number}
                  </TableCell>
                  <TableCell>{tx.recipient_name}</TableCell>
                  <TableCell>{formatDate(tx.transaction_date)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(tx.grand_total)}
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {daysLeft(tx.deleted_at)} hari
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === tx.id}
                        onClick={() => handleRestore(tx)}
                      >
                        {busyId === tx.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <RotateCcw className="size-4" />
                        )}
                        Pulihkan
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Hapus permanen"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(tx)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus permanen?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi {deleteTarget?.transaction_number} akan dihapus selamanya
              dan tidak bisa dipulihkan lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                confirmPermanentDelete();
              }}
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Hapus Permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TrashManager;
