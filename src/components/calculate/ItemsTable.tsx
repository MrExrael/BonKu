"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatNumber, formatRupiah } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface CalcItem {
  id: string;
  product_name: string;
  price: number;
  weight_kg: number;
  total: number;
}

interface ItemsTableProps {
  items: CalcItem[];
  products: string[];
  unitLabel: string;
  onUpdateItem: (id: string, patch: Partial<Omit<CalcItem, "id">>) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
}

/**
 * Input mata uang: menampilkan angka mentah saat fokus, dan format Rupiah
 * (mis. "Rp 80.000") saat blur. Menyimpan nilai sebagai number.
 */
export function CurrencyInput({
  value,
  onChange,
  className,
  ...props
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
} & Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "type"
>) {
  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  const display = focused ? draft : value ? formatRupiah(value) : "";

  return (
    <Input
      inputMode="numeric"
      className={className}
      value={display}
      onFocus={() => {
        setFocused(true);
        setDraft(value ? String(value) : "");
      }}
      onChange={(e) => {
        const digits = e.target.value.replace(/[^\d]/g, "");
        setDraft(digits);
        onChange(digits ? Number(digits) : 0);
      }}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

/** Input berat (kg) yang mendukung desimal (mis. 2.5, 0.75). */
function WeightInput({
  value,
  onChange,
  onEnter,
}: {
  value: number;
  onChange: (value: number) => void;
  onEnter?: () => void;
}) {
  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  const display = focused ? draft : value ? String(value) : "";

  return (
    <Input
      inputMode="decimal"
      placeholder="0"
      className="text-right"
      value={display}
      onFocus={() => {
        setFocused(true);
        setDraft(value ? String(value) : "");
      }}
      onChange={(e) => {
        // Izinkan koma sebagai pemisah desimal, normalisasi ke titik.
        const raw = e.target.value.replace(",", ".");
        if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
          setDraft(raw);
          onChange(raw ? Number(raw) : 0);
        }
      }}
      onBlur={() => setFocused(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter?.();
        }
      }}
    />
  );
}

export function ItemsTable({
  items,
  products,
  unitLabel,
  onUpdateItem,
  onAddRow,
  onRemoveRow,
}: ItemsTableProps) {
  const datalistId = React.useId();
  const totalKg = items.reduce((sum, i) => sum + (i.weight_kg || 0), 0);
  const subtotal = items.reduce((sum, i) => sum + (i.total || 0), 0);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">No</TableHead>
              <TableHead className="min-w-40">Nama Barang</TableHead>
              <TableHead className="w-28 min-w-28">{unitLabel}</TableHead>
              <TableHead className="min-w-32">Harga (Rp)</TableHead>
              <TableHead className="min-w-32 text-right">Hasil (Rp)</TableHead>
              <TableHead className="w-12 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <Input
                    list={datalistId}
                    placeholder="Nama barang"
                    value={item.product_name}
                    onChange={(e) =>
                      onUpdateItem(item.id, { product_name: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <WeightInput
                    value={item.weight_kg}
                    onChange={(weight_kg) =>
                      onUpdateItem(item.id, { weight_kg })
                    }
                    onEnter={onAddRow}
                  />
                </TableCell>
                <TableCell>
                  <CurrencyInput
                    value={item.price}
                    onChange={(price) => onUpdateItem(item.id, { price })}
                  />
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatRupiah(item.total)}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Hapus baris"
                    disabled={items.length <= 1}
                    onClick={() => onRemoveRow(item.id)}
                    className={cn(
                      "text-muted-foreground hover:text-destructive"
                    )}
                  >
                    <X className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-medium">
                Total {unitLabel}
              </TableCell>
              <TableCell className="font-medium tabular-nums">
                {formatNumber(totalKg, 3)}
              </TableCell>
              <TableCell />
              <TableCell className="text-right font-medium tabular-nums">
                {formatRupiah(subtotal)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <datalist id={datalistId}>
        {products.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <Button type="button" variant="outline" size="sm" onClick={onAddRow}>
        <Plus className="size-4" />
        Tambah Baris
      </Button>
    </div>
  );
}

export default ItemsTable;
