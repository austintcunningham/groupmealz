import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionProfile, getRoleHomePath } from "@/lib/auth/guards";
import { BRAND } from "@/lib/brand";
import { listCateringRestaurants } from "@/lib/catering/load";
import { CateringHomePage } from "@/components/marketing/CateringHomePage";

export const metadata: Metadata = {
  title: `${BRAND.name} · ${BRAND.tagline}`,
  description: BRAND.supportingMessage,
  openGraph: {
    title: `${BRAND.name} · ${BRAND.tagline}`,
    description: BRAND.supportingMessage,
  },
};

export default async function HomePage() {
  const profile = await getSessionProfile();
  if (profile) {
    redirect(getRoleHomePath(profile.role));
  }

  const restaurants = await listCateringRestaurants();
  return <CateringHomePage restaurants={restaurants} signedInHref={null} />;
}
