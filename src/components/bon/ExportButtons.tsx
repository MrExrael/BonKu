"use client";

import * as React from "react";
import { FileImage, FileText, Image as ImageIcon, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";

import {
  captureElement,
  exportToImage,
  exportToPDF,
  printElement,
  type PaperSize,
} from "@/lib/utils/export";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Action = "print" | "pdf" | "png" | "jpg";

const SIZE_OPTIONS: { value: PaperSize; label: string }[] = [
  { value: "current", label: "Ukuran sekarang" },
  { value: "a5", label: "A5" },
  { value: "a6", label: "A6" },
];

export function ExportButtons({
  transactionNumber,
  elementId = "bon-template",
}: {
  transactionNumber: string;
  elementId?: string;
}) {
  const [loading, setLoading] = React.useState<Action | null>(null);
  const [size, setSize] = React.useState<PaperSize>("current");
  const baseName = `BonKu-${transactionNumber}`;

  function handlePrint() {
    printElement(elementId);
  }

  async function runExport(action: Exclude<Action, "print">) {
    setLoading(action);
    try {
      const canvas = await captureElement(elementId);
      if (action === "pdf") {
        await exportToPDF(canvas, baseName, size);
      } else {
        exportToImage(canvas, baseName, action, size);
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
    <div className="no-print space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="export-size">Ukuran ekspor</Label>
        <Select
          value={size}
          onValueChange={(v) => v && setSize(v as PaperSize)}
        >
          <SelectTrigger id="export-size" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button
          variant="outline"
          onClick={handlePrint}
          disabled={loading !== null}
        >
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
    </div>
  );
}

export default ExportButtons;
