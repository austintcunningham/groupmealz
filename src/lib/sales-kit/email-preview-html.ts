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

  return `<style>${styles.join("\n")}</style><div class="email-inline-preview">${body}</div>`;
}
