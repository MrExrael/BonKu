"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatRupiah } from "@/lib/utils/format";
import type { TransactionWithItems } from "@/lib/services/transactions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Warna brand BonKu (hex eksplisit agar konsisten & aman dirender SVG).
const COLOR_BAR = "#6366f1";
const COLOR_LINE = "#10b981";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

interface ChartsProps {
  transactions: TransactionWithItems[];
  loading?: boolean;
}

interface MonthDatum {
  label: string;
  count: number;
  income: number;
}

/** Format Rupiah singkat untuk sumbu Y: "Rp 1,2jt", "Rp 950rb". */
function formatRupiahShort(value: number): string {
  if (value >= 1_000_000_000)
    return `Rp ${(value / 1_000_000_000).toFixed(1).replace(".", ",")}M`;
  if (value >= 1_000_000)
    return `Rp ${(value / 1_000_000).toFixed(1).replace(".", ",")}jt`;
  if (value >= 1_000) return `Rp ${Math.round(value / 1_000)}rb`;
  return `Rp ${value}`;
}

function buildMonthlyData(
  transactions: TransactionWithItems[]
): MonthDatum[] {
  const now = new Date();
  const months: MonthDatum[] = [];
  const index = new Map<string, MonthDatum>();

  // 12 bulan terakhir (termasuk bulan ini).
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const datum: MonthDatum = {
      label: MONTH_LABELS[d.getMonth()],
      count: 0,
      income: 0,
    };
    months.push(datum);
    index.set(key, datum);
  }

  for (const tx of transactions) {
    const d = new Date(tx.transaction_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const datum = index.get(key);
    if (datum) {
      datum.count += 1;
      datum.income += tx.grand_total;
    }
  }

  return months;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ value?: number | string }>;
}

function CountTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} transaksi</p>
    </div>
  );
}

function IncomeTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {formatRupiah(Number(payload[0].value ?? 0))}
      </p>
    </div>
  );
}

export function Charts({ transactions, loading }: ChartsProps) {
  const data = React.useMemo(
    () => buildMonthlyData(transactions),
    [transactions]
  );

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Transaksi per Bulan (12 bulan)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  content={<CountTooltip />}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar dataKey="count" fill={COLOR_BAR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pemasukan Bulanan (12 bulan)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 4, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickFormatter={formatRupiahShort}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={64}
                />
                <Tooltip content={<IncomeTooltip />} />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke={COLOR_LINE}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Charts;
