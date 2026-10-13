import { escapeHtml } from "@/lib/email/html-utils";

export const PRINTABLE_CSS = `
  body { margin:0; padding:16px; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#111; background:#fff; }
  .wrap { max-width:640px; margin:0 auto; }
  h1 { font-size:16px; margin:0 0 8px; }
  h2 { font-size:14px; margin:16px 0 8px; }
  .muted { color:#444; font-size:12px; line-height:1.45; }
  .rule { border:0; border-top:1px solid #bbb; margin:16px 0; }
  .bar { background:#ddd; padding:6px 10px; font-weight:bold; font-size:12px; margin:12px 0 8px; }
  .row { display:flex; justify-content:space-between; gap:12px; margin:4px 0; }
  .row.bold { font-weight:bold; }
  .stub { border:2px solid #111; padding:12px; margin:12px 0; }
  table.simple { width:100%; border-collapse:collapse; font-size:13px; }
  table.simple th, table.simple td { padding:6px 8px; border-bottom:1px solid #ccc; text-align:left; }
  table.simple td.num { text-align:right; white-space:nowrap; }
`;

export function wrapPrintableEmail(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light only" />
  <style>${PRINTABLE_CSS}</style>
</head>
<body><div class="wrap">${bodyHtml}</div></body>
</html>`;
}

export function stubRow(label: string, value: string, bold = false): string {
  return `<div class="row${bold ? " bold" : ""}"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`;
}
