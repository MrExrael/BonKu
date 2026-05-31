"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface HistoryFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  recipientName: string;
}

export const EMPTY_FILTERS: HistoryFilters = {
  search: "",
  dateFrom: "",
  dateTo: "",
  recipientName: "",
};

const ALL_RECIPIENTS = "__all__";

interface FilterBarProps {
  filters: HistoryFilters;
  recipients: string[];
  onChange: (filters: HistoryFilters) => void;
}

export function FilterBar({ filters, recipients, onChange }: FilterBarProps) {
  // Search lokal dengan debounce 300ms sebelum diteruskan ke parent.
  const [searchText, setSearchText] = React.useState(filters.search);

  React.useEffect(() => {
    setSearchText(filters.search);
  }, [filters.search]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (searchText !== filters.search) {
        onChange({ ...filters, search: searchText });
      }
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const hasActiveFilter =
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.recipientName;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex-1 space-y-1.5 sm:min-w-56">
        <Label htmlFor="history-search">Cari</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="history-search"
            placeholder="Nama penerima / no. transaksi"
            className="pl-9"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="history-from">Dari Tanggal</Label>
        <Input
          id="history-from"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="history-to">Sampai Tanggal</Label>
        <Input
          id="history-to"
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
        />
      </div>

      <div className="space-y-1.5 sm:min-w-48">
        <Label>Nama Penerima</Label>
        <Select
          value={filters.recipientName || ALL_RECIPIENTS}
          onValueChange={(value) =>
            onChange({
              ...filters,
              recipientName: !value || value === ALL_RECIPIENTS ? "" : value,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Semua penerima" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_RECIPIENTS}>Semua penerima</SelectItem>
            {recipients.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilter ? (
        <Button
          variant="ghost"
          onClick={() => onChange({ ...EMPTY_FILTERS })}
          className="text-muted-foreground"
        >
          <X className="size-4" />
          Reset Filter
        </Button>
      ) : null}
    </div>
  );
}

export default FilterBar;
