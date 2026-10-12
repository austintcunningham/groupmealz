import { redirect } from "next/navigation";

/** @deprecated Use /admin/simulate-order/[slug] for full-screen customer simulation */
export default async function AdminCustomerOrderPreviewRedirect({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string; office?: string; date?: string }>;
}) {
  const { restaurant, office, date } = await searchParams;
  const slug = restaurant ?? "fhs-g";
  const q = new URLSearchParams();
  if (office) q.set("office", office);
  if (date) q.set("date", date);
  const qs = q.toString();
  redirect(`/admin/simulate-order/${encodeURIComponent(slug)}${qs ? `?${qs}` : ""}`);
}
