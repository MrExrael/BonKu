"use client";

import * as React from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  createTransaction,
  getTransactions,
} from "@/lib/services/transactions";
import { createProduct, getProducts } from "@/lib/services/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

interface BackupFile {
  version: string;
  exportedAt: string;
  transactions: BackupTransaction[];
  products: { name: string }[];
}

interface BackupTransaction {
  recipient_name: string;
  phone?: string | null;
  notes?: string | null;
  transaction_date: string;
  subtotal: number;
  debt: number;
  debt_label?: string;
  paid?: number;
  grand_total: number;
  payment_status?: string;
  transaction_items: {
    product_name: string;
    price: number;
    weight_kg: number;
    total: number;
  }[];
}

function todayStamp(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;
}

function isValidBackup(value: unknown): value is BackupFile {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "string" &&
    Array.isArray(v.transactions) &&
    Array.isArray(v.products)
  );
}

export function BackupRestore() {
  const [exporting, setExporting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<BackupFile | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [progress, setProgress] = React.useState({ done: 0, total: 0 });

  async function handleExport() {
    setExporting(true);
    const [txRes, productRes] = await Promise.all([
      getTransactions(),
      getProducts(),
    ]);
    setExporting(false);

    if (txRes.error || productRes.error) {
      toast.error("Gagal mengekspor data", {
        description: txRes.error ?? productRes.error ?? undefined,
      });
      return;
    }

    const backup: BackupFile = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      transactions: (txRes.data ?? []).map((tx) => ({
        recipient_name: tx.recipient_name,
        phone: tx.phone,
        notes: tx.notes,
        transaction_date: tx.transaction_date,
        subtotal: tx.subtotal,
        debt: tx.debt,
        debt_label: tx.debt_label,
        paid: tx.paid,
        grand_total: tx.grand_total,
        payment_status: tx.payment_status,
        transaction_items: (tx.transaction_items ?? []).map((it) => ({
          product_name: it.product_name,
          price: it.price,
          weight_kg: it.weight_kg,
          total: it.total,
        })),
      })),
      products: (productRes.data ?? []).map((p) => ({ name: p.name })),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bonku-backup-${todayStamp()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Backup berhasil diunduh");
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!isValidBackup(parsed)) {
        throw new Error("invalid");
      }
      setPreview(parsed);
    } catch {
      setPreview(null);
      toast.error("Format file tidak dikenali");
    }
  }

  async function runRestore() {
    if (!preview) return;
    setConfirmOpen(false);
    setImporting(true);

    const total = preview.products.length + preview.transactions.length;
    let done = 0;
    setProgress({ done, total });

    // Produk dulu (lewati yang gagal/duplikat tanpa menghentikan proses).
    for (const product of preview.products) {
      if (product?.name) await createProduct(product.name);
      done++;
      setProgress({ done, total });
    }

    let failed = 0;
    for (const tx of preview.transactions) {
      const { error } = await createTransaction({
        recipient_name: tx.recipient_name,
        phone: tx.phone ?? null,
        notes: tx.notes ?? null,
        transaction_date: tx.transaction_date,
        subtotal: tx.subtotal,
        debt: tx.debt,
        debt_label: tx.debt_label || "Hutang",
        paid: tx.paid ?? 0,
        grand_total: tx.grand_total,
        payment_status: tx.payment_status === "belum_lunas"
          ? "belum_lunas"
          : "lunas",
        items: (tx.transaction_items ?? []).map((it) => ({
          product_name: it.product_name,
          price: it.price,
          weight_kg: it.weight_kg,
          total: it.total,
        })),
      });
      if (error) failed++;
      done++;
      setProgress({ done, total });
    }

    setImporting(false);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (failed > 0) {
      toast.warning(`Restore selesai dengan ${failed} transaksi gagal.`);
    } else {
      toast.success("Restore berhasil");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backup Data</CardTitle>
          <CardDescription>
            Unduh seluruh transaksi dan barang Anda dalam satu file JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export JSON
          </Button>
        </CardContent>
      </Card>

      {/* Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Restore Data</CardTitle>
          <CardDescription>
            Pulihkan data dari file backup JSON. Data akan ditambahkan ke akun
            Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelected}
            disabled={importing}
          />

          {preview && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              Ditemukan{" "}
              <span className="font-medium">
                {preview.transactions.length} transaksi
              </span>{" "}
              dan{" "}
              <span className="font-medium">
                {preview.products.length} produk
              </span>
              .
            </div>
          )}

          {importing && (
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${
                      progress.total
                        ? Math.round((progress.done / progress.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Mengimpor {progress.done}/{progress.total}...
              </p>
            </div>
          )}

          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!preview || importing}
          >
            {importing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Mulai Restore
          </Button>
        </CardContent>
      </Card>

      {/* Konfirmasi restore */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mulai restore data?</AlertDialogTitle>
            <AlertDialogDescription>
              {preview?.transactions.length ?? 0} transaksi dan{" "}
              {preview?.products.length ?? 0} produk akan ditambahkan ke akun
              Anda. Nomor transaksi akan dibuat ulang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                runRestore();
              }}
            >
              Ya, Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default BackupRestore;
