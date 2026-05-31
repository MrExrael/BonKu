"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Eye,
  FileImage,
  FileText,
  Image as ImageIcon,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatDate, formatRupiah } from "@/lib/utils/format";
import {
  captureElement,
  exportToImage,
  exportToPDF,
} from "@/lib/utils/export";
import {
  deleteTransaction,
  type TransactionWithItems,
} from "@/lib/services/transactions";
import { useCompanyName } from "@/lib/hooks/use-company-name";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { BonTemplate } from "@/components/bon/BonTemplate";
import { ExportButtons } from "@/components/bon/ExportButtons";

type BonAction = "print" | "pdf" | "png" | "jpg";

interface TransactionsTableProps {
  data: TransactionWithItems[];
  loading?: boolean;
  onChanged?: () => void;
}

export function TransactionsTable({
  data,
  loading,
  onChanged,
}: TransactionsTableProps) {
  const router = useRouter();
  const companyName = useCompanyName();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "transaction_date", desc: true },
  ]);

  // Dialog bon (detail/cetak/export) memakai satu BonTemplate aktif.
  const [activeTx, setActiveTx] = React.useState<TransactionWithItems | null>(
    null
  );
  const [bonOpen, setBonOpen] = React.useState(false);
  const [pending, setPending] = React.useState<BonAction | null>(null);

  // Konfirmasi hapus.
  const [deleteTarget, setDeleteTarget] =
    React.useState<TransactionWithItems | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  function openBon(tx: TransactionWithItems, action: BonAction | null) {
    setActiveTx(tx);
    setPending(action);
    setBonOpen(true);
  }

  // Jalankan aksi cetak/export setelah BonTemplate ter-render di dialog.
  React.useEffect(() => {
    if (!bonOpen || !activeTx || !pending) return;
    const handle = setTimeout(async () => {
      const filename = `BonKu-${activeTx.transaction_number}`;
      try {
        if (pending === "print") {
          window.print();
        } else {
          const canvas = await captureElement("bon-template");
          if (pending === "pdf") await exportToPDF(canvas, filename);
          else exportToImage(canvas, filename, pending);
        }
      } catch {
        toast.info("Ekspor gagal, membuka dialog cetak.");
        window.print();
      } finally {
        setPending(null);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [bonOpen, activeTx, pending]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await deleteTransaction(deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error("Gagal menghapus transaksi", { description: error });
      return;
    }
    toast.success("Transaksi dihapus");
    setDeleteTarget(null);
    onChanged?.();
  }

  const columns = React.useMemo<ColumnDef<TransactionWithItems>[]>(
    () => [
      {
        accessorKey: "transaction_number",
        header: ({ column }) => (
          <SortHeader
            label="Nomor Transaksi"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          />
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.transaction_number}
          </span>
        ),
      },
      {
        accessorKey: "recipient_name",
        header: ({ column }) => (
          <SortHeader
            label="Nama Penerima"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          />
        ),
      },
      {
        accessorKey: "transaction_date",
        header: ({ column }) => (
          <SortHeader
            label="Tanggal"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          />
        ),
        cell: ({ row }) => formatDate(row.original.transaction_date),
      },
      {
        accessorKey: "grand_total",
        header: ({ column }) => (
          <SortHeader
            label="Grand Total"
            className="justify-end"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          />
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">
            {formatRupiah(row.original.grand_total)}
          </div>
        ),
      },
      {
        accessorKey: "payment_status",
        enableSorting: false,
        header: () => "Status",
        cell: ({ row }) => {
          const paid = row.original.payment_status !== "belum_lunas";
          return (
            <Badge
              variant={paid ? "secondary" : "outline"}
              className={
                paid
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }
            >
              {paid ? "Lunas" : "Belum Lunas"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Aksi</span>,
        cell: ({ row }) => {
          const tx = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" })
                  )}
                  aria-label="Aksi"
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openBon(tx, null)}>
                    <Eye className="size-4" />
                    Detail
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/calculate?edit=${tx.id}`)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openBon(tx, "print")}>
                    <Printer className="size-4" />
                    Cetak
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openBon(tx, "pdf")}>
                    <FileText className="size-4" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openBon(tx, "png")}>
                    <ImageIcon className="size-4" />
                    Export PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openBon(tx, "jpg")}>
                    <FileImage className="size-4" />
                    Export JPG
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleteTarget(tx)}
                  >
                    <Trash2 className="size-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [router]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (loading) {
    return (
      <div className="space-y-2 rounded-lg border p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <span className="rounded-full bg-muted p-4 text-muted-foreground">
          <FileText className="size-8" />
        </span>
        <h3 className="font-medium">Belum ada transaksi</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Transaksi yang Anda simpan akan muncul di sini. Coba ubah filter atau
          buat transaksi pertama Anda.
        </p>
        <Link href="/calculate" className={cn(buttonVariants(), "mt-1")}>
          Buat Transaksi Pertama
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
          {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Berikutnya
          </Button>
        </div>
      </div>

      {/* Dialog bon (detail / cetak / export) */}
      <Dialog open={bonOpen} onOpenChange={setBonOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>
              {activeTx?.transaction_number}
            </DialogDescription>
          </DialogHeader>
          {activeTx && (
            <div className="space-y-4">
              <div className="flex justify-center overflow-x-auto rounded-lg border bg-white p-3">
                <BonTemplate transaction={activeTx} companyName={companyName} />
              </div>
              <ExportButtons transactionNumber={activeTx.transaction_number} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Konfirmasi hapus */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi {deleteTarget?.transaction_number} beserta seluruh
              itemnya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SortHeader({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 text-left font-medium hover:text-foreground",
        className
      )}
    >
      {label}
      <ArrowUpDown className="size-3.5 text-muted-foreground" />
    </button>
  );
}

export default TransactionsTable;
