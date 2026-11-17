import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionProfile, getRoleHomePath } from "@/lib/auth/guards";
import { getCateringRestaurantBySlug } from "@/lib/catering/load";
import { CateringCheckoutClient } from "@/components/catering/CateringCheckoutClient";

export const metadata: Metadata = {
  title: "Catering Checkout",
};

export default async function CateringCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getCateringRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const profile = await getSessionProfile();
  const signedInHref = profile ? getRoleHomePath(profile.role) : null;

  return (
    <CateringCheckoutClient restaurant={restaurant} signedInHref={signedInHref} />
  );
}
