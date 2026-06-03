"use client";

import * as React from "react";
import { Loader2, Ruler } from "lucide-react";
import { toast } from "sonner";

import { getProfile, updateProfile } from "@/lib/services/profiles";
import { DEFAULT_UNIT_LABEL } from "@/lib/hooks/use-company-name";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNIT_OPTIONS = ["Kg", "Qty", "Jumlah"];

/**
 * Pengaturan satuan kolom kuantitas di halaman menghitung. Dipakai juga sebagai
 * label kolom & total pada bon (cetak/ekspor) dan detail di history.
 */
export function UnitSettings() {
  const [unit, setUnit] = React.useState(DEFAULT_UNIT_LABEL);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getProfile().then(({ data }) => {
      setUnit(data?.unit_label || DEFAULT_UNIT_LABEL);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    const { error } = await updateProfile({ unit_label: unit });
    setSaving(false);
    if (error) {
      toast.error("Gagal menyimpan satuan", { description: error });
      return;
    }
    toast.success("Satuan diperbarui", {
      description: "Dipakai pada halaman menghitung, bon, dan history.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Ruler className="size-4" />
          Satuan Barang
        </CardTitle>
        <CardDescription>
          Pilih satuan kolom kuantitas (Kg / Qty / Jumlah). Berlaku di halaman
          menghitung, bon, dan history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>Satuan</Label>
          <Select
            value={unit}
            disabled={loading}
            onValueChange={(v) => v && setUnit(v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Simpan Satuan
        </Button>
      </CardContent>
    </Card>
  );
}

export default UnitSettings;
