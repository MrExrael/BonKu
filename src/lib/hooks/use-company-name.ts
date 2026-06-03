"use client";

import * as React from "react";

import { getProfile } from "@/lib/services/profiles";

export const DEFAULT_COMPANY_NAME = "Grosir barang";
export const DEFAULT_UNIT_LABEL = "Kg";

export interface BonSettings {
  companyName: string;
  unitLabel: string;
  ppnEnabled: boolean;
  ppnPercent: number;
}

/**
 * Mengambil pengaturan bon dari profil user: nama perusahaan + satuan
 * (Kg/Qty/Jumlah). Dipakai untuk menampilkan bon (cetak/ekspor) dan kolom
 * kuantitas di halaman menghitung.
 */
export function useProfileSettings(): BonSettings {
  const [settings, setSettings] = React.useState<BonSettings>({
    companyName: DEFAULT_COMPANY_NAME,
    unitLabel: DEFAULT_UNIT_LABEL,
    ppnEnabled: false,
    ppnPercent: 0,
  });

  React.useEffect(() => {
    let active = true;
    getProfile().then(({ data }) => {
      if (!active || !data) return;
      setSettings({
        companyName: data.company_name || DEFAULT_COMPANY_NAME,
        unitLabel: data.unit_label || DEFAULT_UNIT_LABEL,
        ppnEnabled: Boolean(data.ppn_enabled),
        ppnPercent: Number(data.ppn_percent) || 0,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}

/** Hook ringkas khusus nama perusahaan (kompatibilitas). */
export function useCompanyName(): string {
  return useProfileSettings().companyName;
}
