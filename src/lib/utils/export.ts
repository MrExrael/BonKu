/**
 * Helper ekspor bon. html2canvas-pro & jsPDF di-import secara dinamis agar
 * tidak ikut ter-bundle di server / saat halaman pertama dimuat.
 *
 * Memakai html2canvas-pro (fork yang mendukung fungsi warna modern seperti
 * oklch()), karena tema base-nova memakai oklch pada banyak token (mis.
 * border-color global). html2canvas versi lama akan error pada warna oklch.
 */

/** Capture sebuah elemen DOM menjadi canvas (background putih, skala 2x). */
export async function captureElement(
  elementId: string
): Promise<HTMLCanvasElement> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemen dengan id "${elementId}" tidak ditemukan`);
  }

  const html2canvas = (await import("html2canvas-pro")).default;
  return html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
}

/** Pilihan ukuran kertas ekspor. "current" = ukuran asli bon. */
export type PaperSize = "current" | "a5" | "a6";

// Ukuran kertas dalam milimeter (potret).
const PAPER_MM: Record<Exclude<PaperSize, "current">, [number, number]> = {
  a5: [148, 210],
  a6: [105, 148],
};

const PAGE_MARGIN_MM = 8;

/** Ekspor canvas menjadi PDF. Ukuran halaman: asli bon, atau A5/A6. */
export async function exportToPDF(
  canvas: HTMLCanvasElement,
  filename: string,
  size: PaperSize = "current"
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const imgData = canvas.toDataURL("image/png");

  if (size === "current") {
    const orientation =
      canvas.width >= canvas.height ? "landscape" : "portrait";
    const pdf = new jsPDF({
      orientation,
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(ensureExtension(filename, "pdf"));
    return;
  }

  // A5 / A6: tempatkan bon di tengah-atas halaman dengan margin.
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: size });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const maxW = pageW - PAGE_MARGIN_MM * 2;
  const maxH = pageH - PAGE_MARGIN_MM * 2;

  const ratio = canvas.height / canvas.width;
  let drawW = maxW;
  let drawH = drawW * ratio;
  if (drawH > maxH) {
    drawH = maxH;
    drawW = drawH / ratio;
  }
  const x = (pageW - drawW) / 2;
  const y = PAGE_MARGIN_MM;
  pdf.addImage(imgData, "PNG", x, y, drawW, drawH);
  pdf.save(ensureExtension(filename, "pdf"));
}

/** Ekspor canvas menjadi gambar PNG atau JPG dan memicu unduhan. */
export function exportToImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: "png" | "jpg",
  size: PaperSize = "current"
): void {
  const mime = format === "png" ? "image/png" : "image/jpeg";
  const source = size === "current" ? flatten(canvas, format) : paged(canvas, size);

  const dataUrl = source.toDataURL(mime, format === "jpg" ? 0.95 : undefined);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = ensureExtension(filename, format);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Untuk JPG: ratakan ke background putih (PNG transparansi -> hitam di JPG). */
function flatten(
  canvas: HTMLCanvasElement,
  format: "png" | "jpg"
): HTMLCanvasElement {
  if (format !== "jpg") return canvas;
  const opaque = document.createElement("canvas");
  opaque.width = canvas.width;
  opaque.height = canvas.height;
  const ctx = opaque.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, opaque.width, opaque.height);
  ctx.drawImage(canvas, 0, 0);
  return opaque;
}

/** Tempatkan bon di atas kanvas berukuran A5/A6 (background putih), 150 DPI. */
function paged(
  canvas: HTMLCanvasElement,
  size: Exclude<PaperSize, "current">
): HTMLCanvasElement {
  const DPI = 150;
  const mmToPx = (mm: number) => Math.round((mm / 25.4) * DPI);
  const [wmm, hmm] = PAPER_MM[size];
  const pageW = mmToPx(wmm);
  const pageH = mmToPx(hmm);
  const margin = mmToPx(PAGE_MARGIN_MM);

  const page = document.createElement("canvas");
  page.width = pageW;
  page.height = pageH;
  const ctx = page.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, pageW, pageH);

  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const ratio = canvas.height / canvas.width;
  let drawW = maxW;
  let drawH = drawW * ratio;
  if (drawH > maxH) {
    drawH = maxH;
    drawW = drawH / ratio;
  }
  const x = (pageW - drawW) / 2;
  const y = margin;
  ctx.drawImage(canvas, x, y, drawW, drawH);
  return page;
}

function ensureExtension(filename: string, ext: string): string {
  return filename.toLowerCase().endsWith(`.${ext}`)
    ? filename
    : `${filename}.${ext}`;
}

/**
 * Cetak hanya elemen tertentu (mis. bon) dengan membuka jendela baru berisi
 * markup elemen tsb lalu memanggil print. Cara ini menghindari masalah layout
 * saat elemen berada di dalam Dialog ber-transform (print jadi mungil/landscape).
 * Jika popup diblokir, fallback ke window.print().
 */
export function printElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  const win = window.open("", "_blank", "width=460,height=680");
  if (!win) {
    // Popup diblokir → fallback.
    window.print();
    return;
  }

  win.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>Bon</title>` +
      `<style>@page{margin:10mm} html,body{margin:0;padding:0;background:#fff}` +
      `body{display:flex;justify-content:center;padding:8px}</style>` +
      `</head><body>${element.outerHTML}</body></html>`
  );
  win.document.close();
  win.focus();

  // Beri waktu render sebelum print, lalu tutup jendela.
  win.onload = () => {
    win.print();
    win.close();
  };
  // Fallback bila onload tidak terpicu (konten statis).
  setTimeout(() => {
    try {
      win.print();
      win.close();
    } catch {
      /* sudah tertutup */
    }
  }, 400);
}
