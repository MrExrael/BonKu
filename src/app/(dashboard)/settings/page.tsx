"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductsTable } from "@/components/settings/ProductsTable";
import { BackupRestore } from "@/components/settings/BackupRestore";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Kelola daftar barang dan cadangkan data Anda.
        </p>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Kelola Barang</TabsTrigger>
          <TabsTrigger value="backup">Backup &amp; Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Kelola Barang</h2>
            <p className="text-sm text-muted-foreground">
              Tambah, ubah, atau hapus daftar barang yang sering Anda transaksikan.
            </p>
          </div>
          <ProductsTable />
        </TabsContent>

        <TabsContent value="backup" className="mt-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Backup &amp; Restore</h2>
            <p className="text-sm text-muted-foreground">
              Cadangkan seluruh data ke file JSON atau pulihkan dari backup.
            </p>
          </div>
          <BackupRestore />
        </TabsContent>
      </Tabs>
    </div>
  );
}
