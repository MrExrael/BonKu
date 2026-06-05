import Link from "next/link";
import { ChevronRight, ShieldCheck, UserCog } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackupRestore } from "@/components/settings/BackupRestore";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { UnitSettings } from "@/components/settings/UnitSettings";
import { PpnSettings } from "@/components/settings/PpnSettings";
import { TrashManager } from "@/components/settings/TrashManager";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Kelola akun dan data aplikasi Anda.
        </p>
      </div>

      <Tabs defaultValue="akun">
        <TabsList>
          <TabsTrigger value="akun">Akun</TabsTrigger>
          <TabsTrigger value="backup">Backup &amp; Restore</TabsTrigger>
          <TabsTrigger value="sampah">Sampah</TabsTrigger>
        </TabsList>

        <TabsContent value="akun" className="mt-4 space-y-4">
          <CompanySettings />
          <UnitSettings />
          <PpnSettings />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pengaturan Akun</CardTitle>
              <CardDescription>
                Ubah nama, ganti password, dan keluar dari akun Anda di halaman
                Profil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <span className="rounded-md bg-muted p-2 text-muted-foreground">
                  <UserCog className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Profil & Nama</p>
                  <p className="text-xs text-muted-foreground">
                    Perbarui nama tampilan dan lihat email akun.
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <span className="rounded-md bg-muted p-2 text-muted-foreground">
                  <ShieldCheck className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">Keamanan & Keluar</p>
                  <p className="text-xs text-muted-foreground">
                    Ganti password atau keluar dari akun.
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>

              <Link
                href="/profile"
                className={cn(buttonVariants({ variant: "outline" }), "mt-1")}
              >
                Buka Halaman Profil
              </Link>
            </CardContent>
          </Card>
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

        <TabsContent value="sampah" className="mt-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Sampah</h2>
          </div>
          <TrashManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
