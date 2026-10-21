import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

const LETTER_W_IN = 8.5;
const LETTER_H_IN = 11;
const CSS_PX_PER_IN = 96;

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

  const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
  pdf.addImage(dataUrl, "PNG", 0, 0, LETTER_W_IN, LETTER_H_IN);
  pdf.save("groupmeals-restaurant-one-sheet.pdf");
}
