"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import {
  recipientSchema,
  transactionSchema,
  type RecipientInput,
} from "@/lib/validations/transaction";
import { formatDateInput } from "@/lib/utils/format";
import { getProducts } from "@/lib/services/products";
import {
  createTransaction,
  getTransactionById,
  updateTransactionWithItems,
  type TransactionWithItems,
} from "@/lib/services/transactions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfileSettings } from "@/lib/hooks/use-company-name";
import { getRecipients, createRecipient } from "@/lib/services/recipients";
import {
  ItemsTable,
  type CalcItem,
} from "@/components/calculate/ItemsTable";
import {
  SummaryCard,
  type PaymentStatus,
  type DebtLabel,
} from "@/components/calculate/SummaryCard";
import { RecipientForm } from "@/components/calculate/RecipientForm";
import { BonTemplate } from "@/components/bon/BonTemplate";
import { ExportButtons } from "@/components/bon/ExportButtons";

// ----- State item (useReducer) -----
type ItemsAction =
  | { type: "add" }
  | { type: "remove"; id: string }
  | { type: "update"; id: string; patch: Partial<Omit<CalcItem, "id">> }
  | { type: "load"; items: CalcItem[] }
  | { type: "reset" };

function newRow(): CalcItem {
  return {
    id: crypto.randomUUID(),
    product_name: "",
    price: 0,
    weight_kg: 0,
    total: 0,
  };
}

function itemsReducer(state: CalcItem[], action: ItemsAction): CalcItem[] {
  switch (action.type) {
    case "add":
      return [...state, newRow()];
    case "remove":
      return state.length <= 1 ? state : state.filter((i) => i.id !== action.id);
    case "update":
      return state.map((item) => {
        if (item.id !== action.id) return item;
        const next = { ...item, ...action.patch };
        next.total = (next.price || 0) * (next.weight_kg || 0);
        return next;
      });
    case "load":
      return action.items.length > 0 ? action.items : [newRow()];
    case "reset":
      return [newRow()];
    default:
      return state;
  }
}

function CalculateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [editNumber, setEditNumber] = React.useState("");

  const [items, dispatch] = React.useReducer(itemsReducer, undefined, () => [
    newRow(),
  ]);
  const [debt, setDebt] = React.useState(0);
  const [debtLabel, setDebtLabel] = React.useState<DebtLabel>("Hutang");
  const [paid, setPaid] = React.useState(0);
  const [paymentStatus, setPaymentStatus] =
    React.useState<PaymentStatus>("lunas");
  const [products, setProducts] = React.useState<string[]>([]);
  const [recipients, setRecipients] = React.useState<string[]>([]);
  const { companyName, unitLabel, ppnEnabled, ppnPercent } =
    useProfileSettings();
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState<TransactionWithItems | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const recipientForm = useForm<RecipientInput>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      recipient_name: "",
      phone: "",
      notes: "",
      transaction_date: formatDateInput(new Date()),
    },
  });

  const subtotal = React.useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items]
  );
  const totalKg = React.useMemo(
    () => items.reduce((sum, item) => sum + (item.weight_kg || 0), 0),
    [items]
  );
  const ppnAmount = ppnEnabled ? (subtotal * ppnPercent) / 100 : 0;

  const loadRecipients = React.useCallback(() => {
    getRecipients().then(({ data }) => {
      if (data) setRecipients(data.map((r) => r.name));
    });
  }, []);

  React.useEffect(() => {
    getProducts().then(({ data }) => {
      if (data) setProducts(data.map((p) => p.name));
    });
    loadRecipients();
  }, [loadRecipients]);

  async function handleAddRecipient(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Isi nama penerima dulu sebelum menyimpan.");
      return;
    }
    if (recipients.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
      toast.info("Nama penerima sudah tersimpan.");
      return;
    }
    const { error } = await createRecipient(trimmed);
    if (error) {
      toast.error("Gagal menyimpan nama penerima", { description: error });
      return;
    }
    toast.success("Nama penerima disimpan");
    loadRecipients();
  }

  // Mode edit: prefill form dari transaksi yang ada.
  React.useEffect(() => {
    if (!editId) return;
    let active = true;
    getTransactionById(editId).then(({ data, error }) => {
      if (!active) return;
      if (error || !data) {
        toast.error("Gagal memuat transaksi untuk diedit", {
          description: error ?? undefined,
        });
        return;
      }
      setEditNumber(data.transaction_number);
      setPaymentStatus(
        data.payment_status === "belum_lunas" ? "belum_lunas" : "lunas"
      );
      setDebtLabel(
        (["Hutang", "DP", "Panjar", "Pinjaman"].includes(data.debt_label)
          ? data.debt_label
          : "Hutang") as DebtLabel
      );
      setPaid(data.paid ?? 0);
      dispatch({
        type: "load",
        items: data.transaction_items.map((it) => ({
          id: it.id,
          product_name: it.product_name,
          price: it.price,
          weight_kg: it.weight_kg,
          total: it.total,
        })),
      });
      setDebt(data.debt);
      recipientForm.reset({
        recipient_name: data.recipient_name,
        phone: data.phone ?? "",
        notes: data.notes ?? "",
        transaction_date: formatDateInput(new Date(data.transaction_date)),
      });
    });
    return () => {
      active = false;
    };
  }, [editId, recipientForm]);

  async function handleSave() {
    const recipientValid = await recipientForm.trigger();
    const cleanItems = items.filter((i) => i.product_name.trim() !== "");

    if (cleanItems.length === 0) {
      toast.error("Tambahkan minimal 1 item dengan nama barang.");
      return;
    }
    if (!recipientValid) {
      toast.error("Lengkapi data penerima terlebih dahulu.");
      return;
    }

    const values = recipientForm.getValues();
    const candidate = {
      items: cleanItems.map((i) => ({
        product_name: i.product_name.trim(),
        price: i.price,
        weight_kg: i.weight_kg,
        total: i.total,
      })),
      recipient_name: values.recipient_name,
      phone: values.phone || undefined,
      notes: values.notes || undefined,
      transaction_date: values.transaction_date,
      subtotal,
      ppn_percent: ppnEnabled ? ppnPercent : 0,
      ppn_amount: ppnAmount,
      debt,
      debt_label: debtLabel,
      paid,
      grand_total: subtotal - ppnAmount - debt,
      payment_status: paymentStatus,
    };

    const parsed = transactionSchema.safeParse(candidate);
    if (!parsed.success) {
      toast.error("Validasi gagal", {
        description: parsed.error.issues[0]?.message,
      });
      return;
    }

    const payload = {
      recipient_name: parsed.data.recipient_name,
      phone: parsed.data.phone ?? null,
      notes: parsed.data.notes ?? null,
      transaction_date: parsed.data.transaction_date,
      subtotal: parsed.data.subtotal,
      ppn_percent: parsed.data.ppn_percent,
      ppn_amount: parsed.data.ppn_amount,
      debt: parsed.data.debt,
      debt_label: parsed.data.debt_label,
      paid: parsed.data.paid,
      grand_total: parsed.data.grand_total,
      payment_status: parsed.data.payment_status,
      items: parsed.data.items,
    };

    setSaving(true);
    const { data, error } = editId
      ? await updateTransactionWithItems(editId, payload)
      : await createTransaction(payload);
    setSaving(false);

    if (error || !data) {
      // JANGAN reset form agar user bisa mencoba lagi.
      toast.error("Gagal menyimpan transaksi", {
        description: error ?? undefined,
      });
      return;
    }

    if (editId) {
      toast.success("Transaksi berhasil diperbarui", {
        description: data.transaction_number,
      });
      router.push("/history");
      return;
    }

    toast.success("Transaksi berhasil disimpan", {
      description: data.transaction_number,
    });
    setSaved(data);
    setDialogOpen(true);
  }

  function handleNewTransaction() {
    dispatch({ type: "reset" });
    setDebt(0);
    setDebtLabel("Hutang");
    setPaid(0);
    setPaymentStatus("lunas");
    recipientForm.reset({
      recipient_name: "",
      phone: "",
      notes: "",
      transaction_date: formatDateInput(new Date()),
    });
    setSaved(null);
    setDialogOpen(false);
    // Keluar dari mode edit (hapus ?id) jika sedang mengedit.
    if (editId) router.replace("/calculate");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {editId
            ? `Edit Transaksi${editNumber ? ` - ${editNumber}` : ""}`
            : "Menghitung"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editId
            ? "Perbarui data transaksi lalu simpan."
            : "Hitung total belanja dan simpan sebagai transaksi."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemsTable
            items={items}
            products={products}
            unitLabel={unitLabel}
            onUpdateItem={(id, patch) => dispatch({ type: "update", id, patch })}
            onAddRow={() => dispatch({ type: "add" })}
            onRemoveRow={(id) => dispatch({ type: "remove", id })}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Penerima</CardTitle>
          </CardHeader>
          <CardContent>
            <RecipientForm
              form={recipientForm}
              recipients={recipients}
              onAddRecipient={handleAddRecipient}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <SummaryCard
            subtotal={subtotal}
            totalQty={totalKg}
            unitLabel={unitLabel}
            ppnEnabled={ppnEnabled}
            ppnPercent={ppnPercent}
            ppnAmount={ppnAmount}
            debt={debt}
            onDebtChange={setDebt}
            debtLabel={debtLabel}
            onDebtLabelChange={setDebtLabel}
            paid={paid}
            onPaidChange={setPaid}
            paymentStatus={paymentStatus}
            onPaymentStatusChange={setPaymentStatus}
          />
          <Button
            type="button"
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {editId ? "Update Transaksi" : "Simpan Transaksi"}
          </Button>
          {editId && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/history")}
              disabled={saving}
            >
              Batal
            </Button>
          )}
        </div>
      </div>

      {/* Preview bon setelah simpan */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaksi Tersimpan</DialogTitle>
            <DialogDescription>
              Bon siap dicetak atau diekspor.
            </DialogDescription>
          </DialogHeader>

          {saved && (
            <div className="space-y-4">
              <div className="flex justify-center overflow-x-auto rounded-lg border bg-white p-3">
                <BonTemplate
                  transaction={saved}
                  companyName={companyName}
                  unitLabel={unitLabel}
                />
              </div>

              <ExportButtons transactionNumber={saved.transaction_number} />

              <div className="no-print grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleNewTransaction}>
                  Transaksi Baru
                </Button>
                <Button onClick={() => router.push("/history")}>
                  Lihat History
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CalculatePage() {
  return (
    <React.Suspense fallback={null}>
      <CalculateContent />
    </React.Suspense>
  );
}
