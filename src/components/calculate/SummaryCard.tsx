"use client";

import { AlertCircle } from "lucide-react";

import { formatRupiah } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CurrencyInput } from "@/components/calculate/ItemsTable";

interface SummaryCardProps {
  subtotal: number;
  debt: number;
  onDebtChange: (value: number) => void;
}

export function SummaryCard({ subtotal, debt, onDebtChange }: SummaryCardProps) {
  const grandTotal = subtotal - debt;
  const isNegative = grandTotal < 0;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium tabular-nums">
            {formatRupiah(subtotal)}
          </span>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="debt-input">Hutang (opsional)</Label>
          <CurrencyInput
            id="debt-input"
            value={debt}
            onChange={onDebtChange}
            placeholder="Rp 0"
            className={cn(isNegative && "border-destructive")}
          />
          {isNegative && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="size-4" />
              Hutang tidak boleh melebihi subtotal.
            </p>
          )}
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
      </CardContent>
    </Card>
  );
}

export default SummaryCard;
