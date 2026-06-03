import * as React from "react";

import {
  formatDate,
  formatNumber,
  formatRupiah,
  formatTime,
} from "@/lib/utils/format";
import type { TransactionWithItems } from "@/lib/services/transactions";

/**
 * Template bon/nota untuk dicetak & diekspor.
 *
 * PENTING: seluruh warna memakai hex eksplisit (bukan token tema berbasis
 * oklch) agar html2canvas dapat mem-parse warna saat ekspor PDF/PNG/JPG.
 * Lebar tetap 400px untuk konsistensi hasil capture.
 */

const COLORS = {
  ink: "#111111",
  muted: "#555555",
  line: "#000000",
  faint: "#dddddd",
  paper: "#ffffff",
};

const cell: React.CSSProperties = {
  padding: "4px 6px",
  fontSize: 12,
  color: COLORS.ink,
};

export function BonTemplate({
  transaction,
  companyName = "Grosir barang",
  unitLabel = "Kg",
}: {
  transaction: TransactionWithItems;
  companyName?: string;
  unitLabel?: string;
}) {
  const items = transaction.transaction_items ?? [];
  const totalKg = items.reduce((sum, i) => sum + (i.weight_kg || 0), 0);
  const sisa = transaction.grand_total - transaction.paid;
  const isDebtRemaining = transaction.grand_total < 0;
  const isLunas = !isDebtRemaining && Math.abs(sisa) < 0.5;
  const time = formatTime(transaction.created_at);
  const dateValue = time
    ? `${formatDate(transaction.transaction_date)}, ${time}`
    : formatDate(transaction.transaction_date);

  return (
    <div
      id="bon-template"
      style={{
        width: 400,
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
        padding: 24,
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        lineHeight: 1.4,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 1 }}>
          Bon
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
          {companyName}
        </div>
      </div>
      <div style={{ borderTop: `2px solid ${COLORS.line}`, marginBottom: 10 }} />

      {/* Info transaksi */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
        <tbody>
          <InfoRow label="No. Transaksi" value={transaction.transaction_number} />
          <InfoRow label="Tanggal" value={dateValue} />
          <InfoRow label="Nama" value={transaction.recipient_name} />
          {transaction.phone ? (
            <InfoRow label="HP" value={transaction.phone} />
          ) : null}
          {transaction.notes ? (
            <InfoRow label="Keterangan" value={transaction.notes} />
          ) : null}
        </tbody>
      </table>

      {/* Tabel items */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...cell, textAlign: "left", borderBottom: `1px solid ${COLORS.line}`, fontWeight: 700 }}>
              Nama Barang
            </th>
            <th style={{ ...cell, textAlign: "right", borderBottom: `1px solid ${COLORS.line}`, fontWeight: 700 }}>
              {unitLabel}
            </th>
            <th style={{ ...cell, textAlign: "right", borderBottom: `1px solid ${COLORS.line}`, fontWeight: 700 }}>
              Harga
            </th>
            <th style={{ ...cell, textAlign: "right", borderBottom: `1px solid ${COLORS.line}`, fontWeight: 700 }}>
              Hasil
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={{ ...cell, borderBottom: `1px solid ${COLORS.faint}` }}>
                {item.product_name}
              </td>
              <td style={{ ...cell, textAlign: "right", borderBottom: `1px solid ${COLORS.faint}` }}>
                {formatNumber(item.weight_kg, 3)}
              </td>
              <td style={{ ...cell, textAlign: "right", borderBottom: `1px solid ${COLORS.faint}` }}>
                {formatNumber(item.price)}
              </td>
              <td style={{ ...cell, textAlign: "right", borderBottom: `1px solid ${COLORS.faint}` }}>
                {formatNumber(item.total)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ ...cell, fontWeight: 700, borderTop: `1px solid ${COLORS.line}` }}>
              Total {unitLabel}
            </td>
            <td style={{ ...cell, textAlign: "right", fontWeight: 700, borderTop: `1px solid ${COLORS.line}` }}>
              {formatNumber(totalKg, 3)}
            </td>
            <td style={{ ...cell, borderTop: `1px solid ${COLORS.line}` }} />
            <td style={{ ...cell, textAlign: "right", fontWeight: 700, borderTop: `1px solid ${COLORS.line}` }}>
              {formatNumber(transaction.subtotal)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Summary */}
      <div style={{ marginTop: 12 }}>
        <SummaryRow label="Subtotal" value={formatRupiah(transaction.subtotal)} />
        {transaction.debt > 0 ? (
          <SummaryRow
            label={transaction.debt_label || "Hutang"}
            value={formatRupiah(transaction.debt)}
          />
        ) : null}
        <div style={{ borderTop: `1px solid ${COLORS.line}`, margin: "6px 0" }} />
        {isDebtRemaining ? (
          <div style={{ textAlign: "center", padding: "6px 0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c0392b" }}>
              Sisa Hutang
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#c0392b" }}>
              {formatRupiah(transaction.grand_total)}
            </div>
          </div>
        ) : (
          <>
            <SummaryRow
              label="Grand Total"
              value={formatRupiah(transaction.grand_total)}
              bold
            />
            <SummaryRow label="Bayar" value={formatRupiah(transaction.paid)} />
            <SummaryRow
              label={sisa < 0 ? "Kembalian" : "Sisa"}
              value={formatRupiah(Math.abs(sisa))}
            />
            {isLunas ? (
              <div
                style={{
                  textAlign: "center",
                  marginTop: 4,
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#1e8e5a",
                }}
              >
                LUNAS
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `2px solid ${COLORS.line}`, marginTop: 14, paddingTop: 8 }}>
        <div style={{ textAlign: "center", fontSize: 12, color: COLORS.muted }}>
          Terima kasih.
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ ...cell, color: COLORS.muted, width: 110, verticalAlign: "top" }}>
        {label}
      </td>
      <td style={{ ...cell, verticalAlign: "top" }}>: {value}</td>
    </tr>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: bold ? 14 : 12,
        fontWeight: bold ? 800 : 400,
        padding: "2px 0",
        color: COLORS.ink,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default BonTemplate;
