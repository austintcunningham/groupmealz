/** Inline email HTML for print (avoids clipped iframe content in browser PDF/print). */
export function emailHtmlForInlinePreview(fullHtml: string): string {
  const styles: string[] = [];
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match = styleRegex.exec(fullHtml);
  while (match) {
    styles.push(match[1]);
    match = styleRegex.exec(fullHtml);
  }

  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const body = bodyMatch?.[1]?.trim() ?? fullHtml;

  const printKeepTogether = `
@media print {
  .digest-shipment-header,
  .order-block,
  .weekly-payout-stub,
  .weekly-payout-footnotes,
  .stub,
  .totals,
  table.meta,
  table.kv {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  table.meta tr,
  table.kv tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .wrap { max-width: none !important; margin: 0 !important; padding: 0 !important; }
  body { padding: 0 !important; }
  .stub { padding: 10px 12px !important; margin: 0 !important; }
  .rule { margin: 8px 0 !important; }
  table.kv td { padding: 4px 2px !important; font-size: 12px !important; }
  table.kv tr.bold td { padding-top: 6px !important; padding-bottom: 6px !important; }
  .muted { margin: 4px 0 !important; line-height: 1.35 !important; font-size: 11px !important; }
  h1 { font-size: 14px !important; margin: 0 0 6px !important; }
  .order-block { margin: 10px 0 !important; padding-bottom: 8px !important; }
  .bar { margin: 8px 0 6px !important; padding: 4px 8px !important; }
  .office-note { margin: 6px 0 !important; padding: 6px 8px !important; }
}`;

  return `<style>${styles.join("\n")}\n${printKeepTogether}</style><div class="email-inline-preview">${body}</div>`;
}
