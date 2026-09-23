import { BRAND, COLORS } from "@/lib/brand";
import { escapeHtml } from "@/lib/email/html-utils";

/** Meta + inline hints so iOS Mail / Gmail dark mode keep our light palette. */
const LIGHT_MODE_HEAD = `
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <style type="text/css">
    :root { color-scheme: light only; supported-color-schemes: light only; }
    body, .email-outer, .email-card, .email-header, .email-body, .email-footer {
      background-color: ${COLORS.cream} !important;
    }
    .email-outer { background-color: #f1f5f9 !important; }
    .email-header { background-color: ${COLORS.red} !important; }
    .email-body { background-color: ${COLORS.cream} !important; }
    @media (prefers-color-scheme: dark) {
      .email-outer { background-color: #f1f5f9 !important; }
      .email-card, .email-body { background-color: ${COLORS.cream} !important; }
      .email-header { background-color: ${COLORS.red} !important; }
      .email-header-text, .email-headline { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
      .email-brand { color: ${COLORS.yellow} !important; -webkit-text-fill-color: ${COLORS.yellow} !important; }
    }
  </style>`;

/** Branded HTML shell matching the Group Meals site (red header, yellow accent, cream body). */
export function wrapBrandedEmail(options: {
  preheader: string;
  headline: string;
  subheadline?: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  const { preheader, headline, subheadline, bodyHtml, footerNote } = options;
  const safeHeadline = escapeHtml(headline);
  const safePreheader = escapeHtml(preheader);
  const safeSub = subheadline ? escapeHtml(subheadline) : "";
  const safeFooter = footerNote ? escapeHtml(footerNote) : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${LIGHT_MODE_HEAD}
  <title>${safeHeadline}</title>
</head>
<body class="email-outer" style="margin:0;padding:0;background-color:#f1f5f9 !important;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:${COLORS.charcoal};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreheader}</div>
  <table role="presentation" class="email-outer" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f1f5f9" style="background-color:#f1f5f9 !important;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="email-card" width="100%" cellspacing="0" cellpadding="0" bgcolor="${COLORS.cream}" style="max-width:560px;background-color:${COLORS.cream} !important;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td class="email-header" bgcolor="${COLORS.red}" style="background-color:${COLORS.red} !important;padding:28px 24px 24px;text-align:center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td bgcolor="${COLORS.yellow}" style="height:4px;background-color:${COLORS.yellow} !important;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
              <p class="email-brand" style="margin:20px 0 0;font-size:26px;font-weight:900;letter-spacing:-0.02em;color:${COLORS.yellow} !important;-webkit-text-fill-color:${COLORS.yellow} !important;background-color:${COLORS.red} !important;">${BRAND.name}</p>
              <p class="email-header-text" style="margin:8px 0 0;font-size:13px;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;background-color:${COLORS.red} !important;">${BRAND.tagline}</p>
              <h1 class="email-headline" style="margin:20px 0 0;font-size:22px;font-weight:700;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;background-color:${COLORS.red} !important;line-height:1.3;">${safeHeadline}</h1>
              ${safeSub ? `<p class="email-header-text" style="margin:12px 0 0;font-size:14px;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;background-color:${COLORS.red} !important;">${safeSub}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td class="email-body" bgcolor="${COLORS.cream}" style="padding:28px 24px 32px;background-color:${COLORS.cream} !important;color:${COLORS.charcoal} !important;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td class="email-footer" bgcolor="${COLORS.cream}" style="padding:0 24px 28px;text-align:center;background-color:${COLORS.cream} !important;">
              <p style="margin:0;font-size:12px;color:#64748b !important;line-height:1.6;">
                ${safeFooter || `Questions? Reply to this email or contact ${BRAND.supportEmail}.`}
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#94a3b8 !important;">© ${new Date().getFullYear()} ${BRAND.name}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailPrimaryButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:24px auto;">
      <tr>
        <td bgcolor="${COLORS.red}" style="border-radius:10px;background-color:${COLORS.red} !important;">
          <a href="${safeHref}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;background-color:${COLORS.red} !important;text-decoration:none;border-radius:10px;">${safeLabel}</a>
        </td>
      </tr>
    </table>`;
}

export function emailSection(title: string, innerHtml: string): string {
  return `
    <div style="margin-bottom:24px;">
      <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${COLORS.red} !important;-webkit-text-fill-color:${COLORS.red} !important;">${escapeHtml(title)}</h2>
      ${innerHtml}
    </div>`;
}

export function emailInfoRow(label: string, value: string): string {
  return `<p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:${COLORS.charcoal} !important;"><span style="color:#64748b !important;">${escapeHtml(label)}</span><br/><strong style="color:${COLORS.charcoal} !important;">${escapeHtml(value)}</strong></p>`;
}
