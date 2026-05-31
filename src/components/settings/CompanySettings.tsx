"use client";

import * as React from "react";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";

import { getProfile, updateProfile } from "@/lib/services/profiles";
import { DEFAULT_COMPANY_NAME } from "@/lib/hooks/use-company-name";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Pengaturan nama perusahaan. Nama ini otomatis dipakai pada bon yang dicetak
 * / diekspor (BonTemplate membaca company_name dari profil saat dirender).
 */
export function CompanySettings() {
  const [companyName, setCompanyName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getProfile().then(({ data }) => {
      setCompanyName(data?.company_name || DEFAULT_COMPANY_NAME);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    const value = companyName.trim();
    if (!value) {
      toast.error("Nama perusahaan tidak boleh kosong.");
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({ company_name: value });
    setSaving(false);
    if (error) {
      toast.error("Gagal menyimpan nama perusahaan", { description: error });
      return;
    }
    toast.success("Nama perusahaan diperbarui", {
      description: "Otomatis dipakai pada bon yang dicetak/diekspor.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Store className="size-4" />
          Nama Perusahaan
        </CardTitle>
        <CardDescription>
          Nama ini tampil pada bon saat dicetak atau diekspor (PDF/PNG/JPG).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="company-name">Nama Perusahaan / Toko</Label>
          <Input
            id="company-name"
            value={companyName}
            disabled={loading}
            placeholder="mis. Grosir Barang"
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Simpan Nama Perusahaan
        </Button>
      </CardContent>
    </Card>
  );
}

export default CompanySettings;
