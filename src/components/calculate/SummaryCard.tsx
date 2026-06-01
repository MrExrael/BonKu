"use client";

import { AlertCircle } from "lucide-react";

import { formatNumber, formatRupiah } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/calculate/ItemsTable";

export type PaymentStatus = "lunas" | "belum_lunas";
export type DebtLabel = "Hutang" | "DP" | "Panjar" | "Pinjaman";

export const DEBT_LABELS: DebtLabel[] = ["Hutang", "DP", "Panjar", "Pinjaman"];

interface SummaryCardProps {
  subtotal: number;
  totalKg: number;
  debt: number;
  onDebtChange: (value: number) => void;
  debtLabel: DebtLabel;
  onDebtLabelChange: (label: DebtLabel) => void;
  paid: number;
  onPaidChange: (value: number) => void;
  paymentStatus: PaymentStatus;
  onPaymentStatusChange: (status: PaymentStatus) => void;
}

export function SummaryCard({
  subtotal,
  totalKg,
  debt,
  onDebtChange,
  debtLabel,
  onDebtLabelChange,
  paid,
  onPaidChange,
  paymentStatus,
  onPaymentStatusChange,
}: SummaryCardProps) {
  const grandTotal = subtotal - debt;
  const isNegative = grandTotal < 0;
  const sisa = grandTotal - paid;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium tabular-nums">
            {formatRupiah(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Berat</span>
          <span className="font-medium tabular-nums">
            {formatNumber(totalKg, 3)} kg
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Select
              value={debtLabel}
              onValueChange={(v) => v && onDebtLabelChange(v as DebtLabel)}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEBT_LABELS.map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">(opsional)</span>
          </div>
          <CurrencyInput
            value={debt}
            onChange={onDebtChange}
            placeholder="Rp 0"
            className={cn(isNegative && "border-destructive")}
          />
          {isNegative && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {debtLabel} tidak boleh melebihi subtotal.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Status Pembayaran</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={paymentStatus === "lunas" ? "default" : "outline"}
              onClick={() => onPaymentStatusChange("lunas")}
            >
              Lunas
            </Button>
            <Button
              type="button"
              variant={paymentStatus === "belum_lunas" ? "default" : "outline"}
              onClick={() => onPaymentStatusChange("belum_lunas")}
            >
              Belum Lunas
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-semibold">Grand Total</span>
          <span
            className={cn(
              "text-lg font-bold tabular-nums",
              isNegative ? "text-destructive" : "text-foreground"
            )}
          >
            {formatRupiah(grandTotal)}
          </span>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paid-input">Bayar</Label>
          <CurrencyInput
            id="paid-input"
            value={paid}
            onChange={onPaidChange}
            placeholder="Rp 0"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">{sisa < 0 ? "Kembalian" : "Sisa"}</span>
          <span className="text-base font-semibold tabular-nums">
            {formatRupiah(Math.abs(sisa))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default SummaryCard;
