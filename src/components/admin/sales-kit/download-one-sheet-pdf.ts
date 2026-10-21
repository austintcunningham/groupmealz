import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

const LETTER_W_IN = 8.5;
const LETTER_H_IN = 11;

/** Rasterize the one-sheet and save a letter PDF without browser print headers/footers. */
export async function downloadRestaurantOneSheetPdf(): Promise<void> {
  const el = document.querySelector(".restaurant-one-sheet");
  if (!(el instanceof HTMLElement)) {
    throw new Error("One-sheet not found on page.");
  }

  const dataUrl = await toPng(el, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  const aspect = el.offsetHeight / el.offsetWidth;
  let drawW = LETTER_W_IN;
  let drawH = drawW * aspect;
  if (drawH > LETTER_H_IN) {
    drawH = LETTER_H_IN;
    drawW = drawH / aspect;
  }
  const offsetX = (LETTER_W_IN - drawW) / 2;
  const offsetY = (LETTER_H_IN - drawH) / 2;

  const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
  pdf.addImage(dataUrl, "PNG", offsetX, offsetY, drawW, drawH);
  pdf.save("groupmeals-restaurant-one-sheet.pdf");
}
