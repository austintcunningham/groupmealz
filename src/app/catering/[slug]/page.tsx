import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionProfile, getRoleHomePath } from "@/lib/auth/guards";
import {
  getCateringRestaurantBySlug,
  loadCateringMenu,
} from "@/lib/catering/load";
import { CateringRestaurantClient } from "@/components/catering/CateringRestaurantClient";
import { BRAND } from "@/lib/brand";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    zip?: string;
    date?: string;
    time?: string;
    guests?: string;
    fulfillment?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getCateringRestaurantBySlug(slug);
  if (!restaurant) return { title: "Catering" };
  return {
    title: `${restaurant.name} Catering`,
    description:
      restaurant.catering_description ||
      `Order catering from ${restaurant.name} with ${BRAND.name}.`,
  };
}

export default async function CateringRestaurantPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const restaurant = await getCateringRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const { categories, items } = await loadCateringMenu(restaurant.id);
  const profile = await getSessionProfile();
  const signedInHref = profile ? getRoleHomePath(profile.role) : null;

  return (
    <CateringRestaurantClient
      restaurant={restaurant}
      categories={categories}
      items={items}
      signedInHref={signedInHref}
      initialEvent={sp}
    />
  );
}
