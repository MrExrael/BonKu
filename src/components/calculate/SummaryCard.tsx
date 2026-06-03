"use client";

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
  totalQty: number;
  unitLabel: string;
  ppnEnabled: boolean;
  ppnPercent: number;
  ppnAmount: number;
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
  totalQty,
  unitLabel,
  ppnEnabled,
  ppnPercent,
  ppnAmount,
  debt,
  onDebtChange,
  debtLabel,
  onDebtLabelChange,
  paid,
  onPaidChange,
  paymentStatus,
  onPaymentStatusChange,
}: SummaryCardProps) {
  const grandTotal = subtotal - ppnAmount - debt;
  const isDebtRemaining = grandTotal < 0;
  const sisa = grandTotal - paid;
  const isLunas = !isDebtRemaining && Math.abs(sisa) < 0.5;

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
          <span className="text-muted-foreground">Total {unitLabel}</span>
          <span className="font-medium tabular-nums">
            {formatNumber(totalQty, 3)}
          </span>
        </div>

        {ppnEnabled && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              PPN ({formatNumber(ppnPercent, 2)}%)
            </span>
            <span className="font-medium tabular-nums text-destructive">
              -{formatRupiah(ppnAmount)}
            </span>
          </div>
        )}

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
          />
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

        {isDebtRemaining ? (
          <div className="flex flex-col items-center gap-1 py-2 text-center">
            <span className="text-sm font-medium text-destructive">
              Sisa Hutang
            </span>
            <span className="text-3xl font-bold tabular-nums text-destructive">
              {formatRupiah(grandTotal)}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Grand Total</span>
              <span className="text-lg font-bold tabular-nums">
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
              <span className="font-medium">
                {sisa < 0 ? "Kembalian" : "Sisa"}
              </span>
              <span className="text-base font-semibold tabular-nums">
                {formatRupiah(Math.abs(sisa))}
              </span>
            </div>

            {isLunas && (
              <p
                className={cn(
                  "text-center text-lg font-bold",
                  "text-emerald-600 dark:text-emerald-400"
                )}
              >
                LUNAS
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default SummaryCard;
