"use client";

import * as React from "react";
import {
  FileImage,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

import {
  captureElement,
  exportToImage,
  exportToPDF,
  printElement,
  shareToWhatsApp,
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

type Action = "print" | "pdf" | "png" | "jpg" | "wa-jpg" | "wa-pdf";

const SIZE_OPTIONS: { value: PaperSize; label: string }[] = [
  { value: "current", label: "Ukuran sekarang" },
  { value: "a5", label: "A5" },
  { value: "a6", label: "A6" },
];

export function ExportButtons({
  transactionNumber,
  elementId = "bon-template",
  phone,
  waMessage,
}: {
  transactionNumber: string;
  elementId?: string;
  phone?: string | null;
  waMessage?: string;
}) {
  const [loading, setLoading] = React.useState<Action | null>(null);
  const [size, setSize] = React.useState<PaperSize>("current");
  const baseName = `BonKu-${transactionNumber}`;
  const message = waMessage ?? `Bon ${transactionNumber}`;

  function handlePrint() {
    printElement(elementId);
  }

  async function runExport(action: "pdf" | "png" | "jpg") {
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
      toast.info("Ekspor gagal, membuka dialog cetak sebagai alternatif.");
      window.print();
    } finally {
      setLoading(null);
    }
  }

  async function runWhatsApp(format: "jpg" | "pdf") {
    setLoading(`wa-${format}`);
    try {
      const canvas = await captureElement(elementId);
      const result = await shareToWhatsApp(canvas, baseName, format, {
        size,
        phone,
        message,
      });
      if (result === "fallback") {
        toast.info("File diunduh. Lampirkan ke WhatsApp yang terbuka.");
      } else if (result === "shared") {
        toast.success("Bon dibagikan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengirim ke WhatsApp");
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;

  return (
    <div className="no-print space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="export-size">Ukuran cetak & ekspor</Label>
        <Select value={size} onValueChange={(v) => v && setSize(v as PaperSize)}>
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
        <Button variant="outline" onClick={handlePrint} disabled={busy}>
          <Printer className="size-4" />
          Cetak
        </Button>
        <Button variant="outline" onClick={() => runExport("pdf")} disabled={busy}>
          {loading === "pdf" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileText className="size-4" />
          )}
          Export PDF
        </Button>
        <Button variant="outline" onClick={() => runExport("png")} disabled={busy}>
          {loading === "png" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImageIcon className="size-4" />
          )}
          Export PNG
        </Button>
        <Button variant="outline" onClick={() => runExport("jpg")} disabled={busy}>
          {loading === "jpg" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileImage className="size-4" />
          )}
          Export JPG
        </Button>
      </div>

      {/* Kirim ke WhatsApp */}
      <div className="space-y-1.5">
        <Label>Kirim ke WhatsApp</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-600/90"
            onClick={() => runWhatsApp("jpg")}
            disabled={busy}
          >
            {loading === "wa-jpg" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MessageCircle className="size-4" />
            )}
            WA (JPG)
          </Button>
          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-600/90"
            onClick={() => runWhatsApp("pdf")}
            disabled={busy}
          >
            {loading === "wa-pdf" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MessageCircle className="size-4" />
            )}
            WA (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ExportButtons;
