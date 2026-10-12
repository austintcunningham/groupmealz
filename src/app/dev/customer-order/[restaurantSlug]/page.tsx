import { notFound } from "next/navigation";
import { CustomerOrderSimulationShell } from "@/components/order/CustomerOrderSimulationShell";
import { buildRestaurantOrderSimulation } from "@/lib/order/build-simulation-context";

export default async function DevCustomerOrderSimulationPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantSlug: string }>;
  searchParams: Promise<{ office?: string; date?: string }>;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { restaurantSlug } = await params;
  const { office: officeSlug, date: lunchDate } = await searchParams;

  const simulation = await buildRestaurantOrderSimulation(restaurantSlug, {
    officeSlug: officeSlug ?? "lets-geaux-office",
    lunchDate,
  });
  if (!simulation) notFound();

  return <CustomerOrderSimulationShell simulation={simulation} />;
}
