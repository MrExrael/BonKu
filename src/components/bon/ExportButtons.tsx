"use client";

import * as React from "react";
import { FileImage, FileText, Image as ImageIcon, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";

import {
  captureElement,
  exportToImage,
  exportToPDF,
} from "@/lib/utils/export";
import { Button } from "@/components/ui/button";

type Action = "print" | "pdf" | "png" | "jpg";

export function ExportButtons({
  transactionNumber,
  elementId = "bon-template",
}: {
  transactionNumber: string;
  elementId?: string;
}) {
  const [loading, setLoading] = React.useState<Action | null>(null);
  const baseName = `BonKu-${transactionNumber}`;

  function handlePrint() {
    window.print();
  }

  async function runExport(action: Exclude<Action, "print">) {
    setLoading(action);
    try {
      const canvas = await captureElement(elementId);
      if (action === "pdf") {
        await exportToPDF(canvas, baseName);
      } else {
        exportToImage(canvas, baseName, action);
      }
      toast.success(`Bon berhasil diekspor (${action.toUpperCase()})`);
    } catch (err) {
      console.error(err);
      // Fallback: buka dialog cetak agar user tetap bisa menyimpan bon.
      toast.info("Ekspor gagal, membuka dialog cetak sebagai alternatif.");
      window.print();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="no-print grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Button variant="outline" onClick={handlePrint} disabled={loading !== null}>
        <Printer className="size-4" />
        Cetak
      </Button>
      <Button
        variant="outline"
        onClick={() => runExport("pdf")}
        disabled={loading !== null}
      >
        {loading === "pdf" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
        Export PDF
      </Button>
      <Button
        variant="outline"
        onClick={() => runExport("png")}
        disabled={loading !== null}
      >
        {loading === "png" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImageIcon className="size-4" />
        )}
        Export PNG
      </Button>
      <Button
        variant="outline"
        onClick={() => runExport("jpg")}
        disabled={loading !== null}
      >
        {loading === "jpg" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileImage className="size-4" />
        )}
        Export JPG
      </Button>
    </div>
  );
}

export default ExportButtons;
