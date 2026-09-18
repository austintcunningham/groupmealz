import { BRAND, COLORS } from "@/lib/brand";

/** Branded HTML shell matching the Group Meals site (red header, yellow accent, cream body). */
export function wrapBrandedEmail(options: {
  preheader: string;
  headline: string;
  subheadline?: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  const { preheader, headline, subheadline, bodyHtml, footerNote } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:${COLORS.charcoal};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${COLORS.cream};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, ${COLORS.red} 0%, ${COLORS.redDark} 60%, #8B0000 100%);padding:28px 24px 0;text-align:center;">
              <div style="height:4px;background:linear-gradient(90deg, ${COLORS.yellow} 0%, ${COLORS.yellowLight} 100%);border-radius:2px;margin-bottom:20px;"></div>
              <p style="margin:0;font-size:26px;font-weight:900;letter-spacing:-0.02em;color:${COLORS.yellow};">${BRAND.name}</p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">${BRAND.tagline}</p>
              <h1 style="margin:20px 0 24px;font-size:22px;font-weight:700;color:#fff;line-height:1.3;">${headline}</h1>
              ${subheadline ? `<p style="margin:-12px 0 20px;font-size:14px;color:rgba(255,255,255,0.9);">${subheadline}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
                ${footerNote ?? `Questions? Reply to this email or contact ${BRAND.supportEmail}.`}
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} ${BRAND.name}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailSection(title: string, innerHtml: string): string {
  return `
    <div style="margin-bottom:24px;">
      <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${COLORS.red};">${title}</h2>
      ${innerHtml}
    </div>`;
}

export function emailInfoRow(label: string, value: string): string {
  return `<p style="margin:0 0 8px;font-size:14px;line-height:1.5;"><span style="color:#64748b;">${label}</span><br/><strong style="color:${COLORS.charcoal};">${value}</strong></p>`;
}
