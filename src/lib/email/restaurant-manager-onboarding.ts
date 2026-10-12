import { BRAND } from "@/lib/brand";
import { escapeHtml } from "@/lib/email/html-utils";
import { emailPrimaryButton, emailSection, wrapBrandedEmail } from "@/lib/email/layout";

export function buildRestaurantManagerInviteHtml(input: {
  restaurantName: string;
  signupUrl: string;
  loginUrl: string;
  isExistingAccount: boolean;
  baseUrl: string;
}): string {
  const name = escapeHtml(input.restaurantName);
  const base = input.baseUrl.replace(/\/$/, "");

  const steps = `
    <ol style="margin:0;padding-left:20px;font-size:15px;line-height:1.6;color:#334155 !important;">
      <li style="margin-bottom:12px;">
        <strong>${input.isExistingAccount ? "Sign in" : "Create your account"}</strong> with the
        <strong>same email address</strong> this message was sent to. Your manager access is already
        linked to <strong>${name}</strong>.
      </li>
      <li style="margin-bottom:12px;">
        <strong>Logo &amp; banner</strong> — open <strong>Branding</strong> in your portal. Paste
        public image URLs for your logo and hero banner (JPEG/PNG). Submit for ${BRAND.name} approval;
        approved images appear on office order pages and announcement emails.
      </li>
      <li style="margin-bottom:12px;">
        <strong>Build your menu</strong> — under <strong>Menu</strong>, add categories (Bowls,
        Sandwiches, etc.), then add items with prices. Mark sides/drinks as non-entrées so the
        $2.50 service fee applies only to entrées.
      </li>
      <li style="margin-bottom:12px;">
        <strong>Temporary deals</strong> — on any menu item, set a promo price, optional label
        (e.g. &quot;Today only&quot;), and an end date. The deal price shows automatically until that
        date; clear the promo to revert to your regular price.
      </li>
      <li style="margin-bottom:12px;">
        <strong>Day-of lunch</strong> — use <strong>Prep list</strong> for item counts and special
        instructions when you&apos;re Restaurant of the Day. Toggle <strong>Available</strong> off on
        Menu if you sell out of an item.
      </li>
      <li>
        <strong>Sales &amp; payouts</strong> — review daily sales and weekly check stubs under
        <strong>Sales &amp; payouts</strong> after each office lunch.
      </li>
    </ol>`;

  const linksBlock = `
    <p style="margin:16px 0 8px;font-size:14px;color:#64748b !important;">Quick links after you sign in:</p>
    <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;color:#334155 !important;">
      <li>Menu — ${escapeHtml(`${base}/restaurant/menu`)}</li>
      <li>Branding — ${escapeHtml(`${base}/restaurant/branding`)}</li>
      <li>Prep list — ${escapeHtml(`${base}/restaurant/production`)}</li>
      <li>Sales &amp; payouts — ${escapeHtml(`${base}/restaurant/reports`)}</li>
    </ul>`;

  const ctaUrl = input.isExistingAccount ? input.loginUrl : input.signupUrl;
  const ctaLabel = input.isExistingAccount ? "Sign in to your portal →" : "Create your account →";

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#334155 !important;">
      You&apos;re invited to manage <strong>${name}</strong> on ${BRAND.name} — scheduled office
      lunches, online ordering, and payouts in one place.
    </p>
    ${emailPrimaryButton(ctaUrl, ctaLabel)}
    ${emailSection("Getting started", steps)}
    ${linksBlock}`;

  return wrapBrandedEmail({
    preheader: `Set up menu, branding, and deals for ${input.restaurantName}`,
    headline: "Welcome, partner",
    subheadline: input.restaurantName,
    bodyHtml,
    footerNote: `Questions? Reply or write ${BRAND.supportEmail}.`,
  });
}
