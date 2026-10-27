import { BRAND, COLORS, getBrandLogoUrl } from "@/lib/brand";
import { escapeHtml } from "@/lib/email/html-utils";

/** Meta + inline hints so iOS Mail / Gmail dark mode keep our light palette. */
const LIGHT_MODE_HEAD = `
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <style type="text/css">
    :root { color-scheme: light only; supported-color-schemes: light only; }
    body, .email-outer, .email-card, .email-body, .email-footer {
      background-color: ${COLORS.cream} !important;
    }
    .email-outer { background-color: #f1f5f9 !important; }
    .email-logo-row { background-color: ${COLORS.cream} !important; }
    .email-header { background-color: ${COLORS.red} !important; }
    .email-body { background-color: ${COLORS.cream} !important; }
    @media (prefers-color-scheme: dark) {
      .email-outer { background-color: #f1f5f9 !important; }
      .email-card, .email-body, .email-logo-row { background-color: ${COLORS.cream} !important; }
      .email-header { background-color: ${COLORS.red} !important; }
      .email-headline { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
    }
  </style>`;

function emailLogoBlock(logoUrl: string): string {
  const safeUrl = escapeHtml(logoUrl);
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td class="email-logo-row" align="center" bgcolor="${COLORS.cream}" style="padding:28px 24px 20px;background-color:${COLORS.cream} !important;">
          <img src="${safeUrl}" width="240" alt="${escapeHtml(BRAND.name)}" style="display:block;width:240px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;" />
          <p style="margin:12px 0 0;font-size:13px;color:#64748b !important;line-height:1.4;">${escapeHtml(BRAND.tagline)}</p>
        </td>
      </tr>
      <tr>
        <td bgcolor="${COLORS.yellow}" style="height:4px;background-color:${COLORS.yellow} !important;font-size:0;line-height:0;">&nbsp;</td>
      </tr>
    </table>`;
}

/** Branded HTML shell matching the GroupMeals site (logo, red header, cream body). */
export function wrapBrandedEmail(options: {
  preheader: string;
  headline: string;
  subheadline?: string;
  bodyHtml: string;
  footerNote?: string;
  logoUrl?: string;
  /** Sales-kit print: skip logo block to keep caption + sample on one page. */
  omitLogo?: boolean;
}): string {
  const { preheader, headline, subheadline, bodyHtml, footerNote, omitLogo } = options;
  const logoUrl = options.logoUrl ?? getBrandLogoUrl();
  const safeHeadline = escapeHtml(headline);
  const safePreheader = escapeHtml(preheader);
  const safeSub = subheadline ? escapeHtml(subheadline) : "";
  const safeFooter = footerNote ? escapeHtml(footerNote) : "";
  const logoRow = omitLogo
    ? ""
    : `<tr><td style="padding:0;">${emailLogoBlock(logoUrl)}</td></tr>`;
  const headerPad = omitLogo ? "16px 20px 18px" : "20px 24px 24px";
  const bodyPad = omitLogo ? "18px 20px 20px" : "28px 24px 32px";
  const outerPad = omitLogo ? "12px 8px" : "32px 16px";

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
  <table role="presentation" class="email-outer" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f1f5f9" style="background-color:#f1f5f9 !important;padding:${outerPad};">
    <tr>
      <td align="center">
        <table role="presentation" class="email-card" width="100%" cellspacing="0" cellpadding="0" bgcolor="${COLORS.cream}" style="max-width:560px;background-color:${COLORS.cream} !important;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          ${logoRow}
          <tr>
            <td class="email-header" bgcolor="${COLORS.red}" style="background-color:${COLORS.red} !important;padding:${headerPad};text-align:center;">
              <h1 class="email-headline" style="margin:0;font-size:${omitLogo ? "18px" : "22px"};font-weight:700;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;background-color:${COLORS.red} !important;line-height:1.3;">${safeHeadline}</h1>
              ${safeSub ? `<p class="email-header-text" style="margin:8px 0 0;font-size:13px;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;background-color:${COLORS.red} !important;">${safeSub}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td class="email-body" bgcolor="${COLORS.cream}" style="padding:${bodyPad};background-color:${COLORS.cream} !important;color:${COLORS.charcoal} !important;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td class="email-footer" bgcolor="${COLORS.cream}" style="padding:0 20px 18px;text-align:center;background-color:${COLORS.cream} !important;">
              <p style="margin:0;font-size:12px;color:#64748b !important;line-height:1.6;">
                ${safeFooter || `Questions? Reply to this email or contact ${BRAND.supportEmail}.`}
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#94a3b8 !important;">© ${new Date().getFullYear()} ${BRAND.name}</p>
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
