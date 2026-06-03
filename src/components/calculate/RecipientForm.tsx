"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Plus } from "lucide-react";

import type { RecipientInput } from "@/lib/validations/transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * Form data penerima. Instance form dimiliki oleh halaman (calculate/page.tsx)
 * sehingga nilai & validasinya bisa digabung saat menyimpan transaksi.
 *
 * `recipients` = daftar nama tersimpan untuk autocomplete; `onAddRecipient`
 * menyimpan nama yang sedang diketik agar bisa dipakai lagi nanti.
 */
export function RecipientForm({
  form,
  recipients,
  onAddRecipient,
}: {
  form: UseFormReturn<RecipientInput>;
  recipients: string[];
  onAddRecipient: (name: string) => void;
}) {
  const notes = form.watch("notes") ?? "";
  const datalistId = React.useId();

  return (
    <Form {...form}>
      <datalist id={datalistId}>
        {recipients.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="recipient_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Penerima</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    list={datalistId}
                    placeholder="Cari / ketik nama penerima"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Simpan nama penerima"
                  title="Simpan nama penerima"
                  onClick={() => onAddRecipient(field.value?.trim() ?? "")}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon (opsional)</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="08xxxxxxxxxx"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Transaksi</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Catatan (opsional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Catatan tambahan..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription className="text-right">
                {notes.length}/500
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}

export default RecipientForm;
