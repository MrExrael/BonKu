import { ProductsTable } from "@/components/settings/ProductsTable";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kelola Barang</h1>
        <p className="text-sm text-muted-foreground">
          Tambah, ubah, atau hapus daftar barang yang sering Anda transaksikan.
        </p>
      </div>
      <ProductsTable />
    </div>
  );
}
