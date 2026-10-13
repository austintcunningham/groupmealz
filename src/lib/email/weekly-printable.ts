import { escapeHtml } from "@/lib/email/html-utils";

/** Table-based rows — flex is unreliable in email clients and many preview iframes. */
const ROW_TABLE = `
  table.kv { width:100%; border-collapse:collapse; margin:0 0 4px; }
  table.kv td { padding:8px 4px; vertical-align:top; font-size:14px; line-height:1.4; }
  table.kv td.val { text-align:right; white-space:nowrap; padding-left:16px; }
  table.kv tr.bold td { font-weight:bold; padding-top:10px; padding-bottom:10px; }
`;

export const PRINTABLE_CSS = `
  body { margin:0; padding:20px; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#111; background:#fff; line-height:1.45; }
  .wrap { max-width:640px; margin:0 auto; }
  h1 { font-size:18px; margin:0 0 12px; line-height:1.3; }
  h2 { font-size:15px; margin:20px 0 10px; }
  .muted { color:#444; font-size:13px; line-height:1.5; margin:8px 0; }
  .rule { border:0; border-top:1px solid #bbb; margin:18px 0; }
  .bar { background:#ddd; padding:10px 12px; font-weight:bold; font-size:13px; margin:20px 0 10px; }
  .stub { border:2px solid #111; padding:16px 18px; margin:16px 0; }
  table.simple { width:100%; border-collapse:collapse; font-size:14px; margin:8px 0 16px; }
  table.simple th { padding:10px 12px; border-bottom:2px solid #999; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:0.04em; }
  table.simple td { padding:10px 12px; border-bottom:1px solid #ddd; vertical-align:top; }
  table.simple td.num, table.simple th.num { text-align:right; white-space:nowrap; width:72px; }
  ${ROW_TABLE}
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
  return `<table class="kv" role="presentation" cellpadding="0" cellspacing="0">
    <tr class="${bold ? "bold" : ""}">
      <td>${escapeHtml(label)}</td>
      <td class="val">${escapeHtml(value)}</td>
    </tr>
  </table>`;
}
