"use client";

import * as React from "react";
import { Check, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/lib/utils/format";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "@/lib/services/products";
import type { Product } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function ProductsTable() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [newName, setNewName] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");

  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const { data } = await getProducts();
    setProducts(data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  function isDuplicate(name: string, exceptId?: string): boolean {
    const lower = name.trim().toLowerCase();
    return products.some(
      (p) => p.id !== exceptId && p.name.trim().toLowerCase() === lower
    );
  }

  async function handleAdd() {
    const name = newName.trim();
    if (!name) {
      toast.error("Nama barang tidak boleh kosong.");
      return;
    }
    if (isDuplicate(name)) {
      toast.error("Nama barang sudah ada.");
      return;
    }
    setAdding(true);
    const { error } = await createProduct(name);
    setAdding(false);
    if (error) {
      toast.error("Gagal menambah barang", { description: error });
      return;
    }
    toast.success("Barang ditambahkan");
    setNewName("");
    load();
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditName(product.name);
  }

  async function saveEdit(id: string) {
    const name = editName.trim();
    if (!name) {
      toast.error("Nama barang tidak boleh kosong.");
      return;
    }
    if (isDuplicate(name, id)) {
      toast.error("Nama barang sudah ada.");
      return;
    }
    const { error } = await updateProduct(id, name);
    if (error) {
      toast.error("Gagal mengubah barang", { description: error });
      return;
    }
    toast.success("Barang diperbarui");
    setEditingId(null);
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await deleteProduct(deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error("Gagal menghapus barang", { description: error });
      return;
    }
    toast.success("Barang dihapus");
    setDeleteTarget(null);
    load();
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Form tambah produk */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Nama barang baru"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button onClick={handleAdd} disabled={adding}>
          {adding ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Tambah
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari barang..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-2 rounded-lg border p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          {products.length === 0
            ? "Belum ada barang. Tambahkan barang pertama Anda di atas."
            : "Tidak ada barang yang cocok dengan pencarian."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Barang</TableHead>
                <TableHead className="w-40">Tanggal Dibuat</TableHead>
                <TableHead className="w-28 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const editing = editingId === product.id;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {editing ? (
                        <Input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEdit(product.id);
                            }
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      ) : (
                        <span className="font-medium">{product.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.created_at ? formatDate(product.created_at) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {editing ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Simpan"
                            onClick={() => saveEdit(product.id)}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Batal"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Edit"
                            onClick={() => startEdit(product)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Hapus"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(product)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Konfirmasi hapus */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus barang?</AlertDialogTitle>
            <AlertDialogDescription>
              Barang &quot;{deleteTarget?.name}&quot; akan dihapus. Transaksi
              lama yang sudah mencatat barang ini tidak terpengaruh.
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

export default ProductsTable;
