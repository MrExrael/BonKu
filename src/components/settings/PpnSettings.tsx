"use client";

import * as React from "react";
import { Loader2, Percent } from "lucide-react";
import { toast } from "sonner";

import { getProfile, updateProfile } from "@/lib/services/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Pengaturan PPN. Jika aktif, PPN (persen dari subtotal) akan MENGURANGI
 * subtotal pada perhitungan, tampil di ringkasan & bon. Nilai PPN disimpan
 * per transaksi saat menyimpan, jadi bon lama tidak berubah bila setting diubah.
 */
export function PpnSettings() {
  const [enabled, setEnabled] = React.useState(false);
  const [percent, setPercent] = React.useState("11");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getProfile().then(({ data }) => {
      if (data) {
        setEnabled(Boolean(data.ppn_enabled));
        setPercent(String(data.ppn_percent ?? 11));
      }
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    const value = Number(percent.replace(",", "."));
    if (Number.isNaN(value) || value < 0) {
      toast.error("Persen PPN tidak valid.");
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({
      ppn_enabled: enabled,
      ppn_percent: value,
    });
    setSaving(false);
    if (error) {
      toast.error("Gagal menyimpan PPN", { description: error });
      return;
    }
    toast.success("Pengaturan PPN disimpan", {
      description: "Diterapkan pada perhitungan, bon, dan history.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Percent className="size-4" />
          PPN
        </CardTitle>
        <CardDescription>
          Jika aktif, PPN mengurangi subtotal dan tampil di bawah subtotal pada
          ringkasan & bon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="ppn-enabled">Aktifkan PPN</Label>
          <Switch
            id="ppn-enabled"
            checked={enabled}
            disabled={loading}
            onCheckedChange={setEnabled}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ppn-percent">Persen PPN (%)</Label>
          <Input
            id="ppn-percent"
            inputMode="decimal"
            className="w-32"
            value={percent}
            disabled={loading || !enabled}
            onChange={(e) => setPercent(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={saving || loading}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Simpan PPN
        </Button>
      </CardContent>
    </Card>
  );
}

export default PpnSettings;
