import { BRAND } from "@/lib/brand";
import { wrapBrandedEmail } from "@/lib/email/layout";

export type RotdEmailInput = {
  officeName: string;
  lunchDate: string;
  restaurantName: string;
  restaurantDescription?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  orderLink: string;
  cutoffLabel: string;
  deliveryLabel: string;
  headline?: string;
  extraHtml?: string;
};

export function buildRestaurantOfTheDayHtml(input: RotdEmailInput): string {
  const dateLabel = new Date(`${input.lunchDate}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const headline = input.headline ?? `Restaurant of the Day: ${input.restaurantName}`;

  const hero = input.bannerUrl
    ? `<img src="${input.bannerUrl}" alt="" style="width:100%;max-height:200px;object-fit:cover;border-radius:12px;margin-bottom:16px" />`
    : "";

  const logo = input.logoUrl
    ? `<img src="${input.logoUrl}" alt="" style="height:56px;width:56px;border-radius:8px;object-fit:cover;vertical-align:middle;margin-right:12px" />`
    : "";

  const bodyHtml = `
    ${hero}
    <div style="display:flex;align-items:center;margin-bottom:16px">
      ${logo}
      <div>
        <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a">${input.restaurantName}</p>
        ${input.restaurantDescription ? `<p style="margin:4px 0 0;color:#64748b">${input.restaurantDescription}</p>` : ""}
      </div>
    </div>
    <p style="font-size:16px;line-height:1.5;color:#334155">
      ${dateLabel} at <strong>${input.officeName}</strong> — order while the window is open. No account needed.
    </p>
    <p style="margin:16px 0;font-size:14px;line-height:1.5;color:#475569">
      <strong>Order by:</strong> ${input.cutoffLabel}<br/>
      <strong>Delivery:</strong> ${input.deliveryLabel}
    </p>
    ${input.extraHtml ?? ""}
    <p style="margin:24px 0;text-align:center">
      <a href="${input.orderLink}" style="display:inline-block;background:#D62828;color:#fff;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none">
        Order lunch now →
      </a>
    </p>`;

  return wrapBrandedEmail({
    preheader: `${input.restaurantName} is lunch on ${dateLabel} — order now`,
    headline,
    subheadline: input.officeName,
    bodyHtml,
    footerNote: `You're receiving this because your office enabled Restaurant of the Day emails on ${BRAND.name}.`,
  });
}
