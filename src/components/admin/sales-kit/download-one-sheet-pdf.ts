import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";

const LETTER_W_IN = 8.5;
const LETTER_H_IN = 11;
const PX_PER_IN = 96;

const CAPTURE_PROPS = [
  "width",
  "maxWidth",
  "minHeight",
  "height",
  "margin",
  "marginLeft",
  "marginRight",
  "boxShadow",
  "overflow",
  "borderRadius",
  "transform",
] as const;

function letterPx() {
  return {
    widthPx: Math.round(LETTER_W_IN * PX_PER_IN),
    heightPx: Math.round(LETTER_H_IN * PX_PER_IN),
  };
}

function lockElementForLetterCapture(el: HTMLElement, widthPx: number, heightPx: number) {
  const previous = CAPTURE_PROPS.reduce(
    (acc, key) => {
      acc[key] = el.style[key];
      return acc;
    },
    {} as Record<(typeof CAPTURE_PROPS)[number], string>
  );

  el.classList.add("one-sheet-capture");
  el.style.width = `${widthPx}px`;
  el.style.maxWidth = `${widthPx}px`;
  el.style.minHeight = `${heightPx}px`;
  el.style.height = `${heightPx}px`;
  el.style.margin = "0";
  el.style.marginLeft = "0";
  el.style.marginRight = "0";
  el.style.boxShadow = "none";
  el.style.overflow = "hidden";
  el.style.borderRadius = "0";
  el.style.transform = "none";

  return () => {
    el.classList.remove("one-sheet-capture");
    for (const key of CAPTURE_PROPS) {
      el.style[key] = previous[key];
    }
  };
}

/** Rasterize the one-sheet at exact letter size and save a PDF (no browser print chrome). */
export async function downloadRestaurantOneSheetPdf(): Promise<void> {
  const el = document.querySelector(".restaurant-one-sheet");
  if (!(el instanceof HTMLElement)) {
    throw new Error("One-sheet not found on page.");
  }

  const { widthPx, heightPx } = letterPx();
  const unlock = lockElementForLetterCapture(el, widthPx, heightPx);

  try {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const canvas = await toCanvas(el, {
      width: widthPx,
      height: heightPx,
      canvasWidth: widthPx,
      canvasHeight: heightPx,
      pixelRatio: 1,
      backgroundColor: "#ffffff",
      cacheBust: true,
      style: {
        margin: "0",
        transform: "none",
        boxShadow: "none",
      },
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "letter",
      compress: true,
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, LETTER_W_IN, LETTER_H_IN);
    pdf.save("groupmeals-restaurant-one-sheet.pdf");
  } finally {
    unlock();
  }
}
