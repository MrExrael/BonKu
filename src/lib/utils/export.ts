/**
 * Helper ekspor bon. html2canvas & jsPDF di-import secara dinamis agar tidak
 * ikut ter-bundle di server / saat halaman pertama dimuat.
 *
 * Catatan penting: html2canvas TIDAK mendukung fungsi warna CSS modern seperti
 * oklch(). Pastikan elemen yang di-capture (mis. BonTemplate) hanya memakai
 * warna eksplisit (hex/rgb), bukan token tema berbasis oklch.
 */

/** Capture sebuah elemen DOM menjadi canvas (background putih, skala 2x). */
export async function captureElement(
  elementId: string
): Promise<HTMLCanvasElement> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemen dengan id "${elementId}" tidak ditemukan`);
  }

  const html2canvas = (await import("html2canvas")).default;
  return html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
}

/** Ekspor canvas menjadi PDF dengan ukuran halaman mengikuti rasio canvas. */
export async function exportToPDF(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const imgData = canvas.toDataURL("image/png");
  const orientation = canvas.width >= canvas.height ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(ensureExtension(filename, "pdf"));
}

/** Ekspor canvas menjadi gambar PNG atau JPG dan memicu unduhan. */
export function exportToImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: "png" | "jpg"
): void {
  const mime = format === "png" ? "image/png" : "image/jpeg";
  let source = canvas;

  // JPG tidak mendukung transparansi → ratakan ke background putih.
  if (format === "jpg") {
    const opaque = document.createElement("canvas");
    opaque.width = canvas.width;
    opaque.height = canvas.height;
    const ctx = opaque.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, opaque.width, opaque.height);
      ctx.drawImage(canvas, 0, 0);
      source = opaque;
    }
  }

  const dataUrl = source.toDataURL(mime, format === "jpg" ? 0.95 : undefined);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = ensureExtension(filename, format);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function ensureExtension(filename: string, ext: string): string {
  return filename.toLowerCase().endsWith(`.${ext}`)
    ? filename
    : `${filename}.${ext}`;
}
