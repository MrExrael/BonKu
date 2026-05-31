"use client";

import * as React from "react";

import { getProfile } from "@/lib/services/profiles";

export const DEFAULT_COMPANY_NAME = "Grosir barang";

/**
 * Mengambil nama perusahaan user yang login (dari profiles.company_name).
 * Dipakai untuk menampilkan nama perusahaan pada bon/cetak.
 */
export function useCompanyName(): string {
  const [name, setName] = React.useState(DEFAULT_COMPANY_NAME);

  React.useEffect(() => {
    let active = true;
    getProfile().then(({ data }) => {
      if (active && data?.company_name) setName(data.company_name);
    });
    return () => {
      active = false;
    };
  }, []);

  return name;
}
