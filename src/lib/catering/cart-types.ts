export type CateringFulfillment = "delivery" | "pickup";

export type CateringCartLine = {
  key: string;
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  servesEach: number | null;
  packaging: string | null;
  specialInstructions: string;
};

export type CateringEventDetails = {
  fulfillment: CateringFulfillment;
  address: string;
  zip: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
};

export type CateringCartState = {
  restaurantId: string | null;
  restaurantSlug: string | null;
  restaurantName: string | null;
  liveOrders: boolean;
  minOrderCents: number | null;
  deliveryFeeCents: number;
  leadHours: number;
  event: CateringEventDetails;
  lines: CateringCartLine[];
};

export const defaultCateringEvent = (): CateringEventDetails => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const eventDate = d.toISOString().slice(0, 10);
  return {
    fulfillment: "delivery",
    address: "",
    zip: "",
    eventDate,
    eventTime: "12:00",
    guestCount: 10,
  };
};

export const emptyCateringCart = (): CateringCartState => ({
  restaurantId: null,
  restaurantSlug: null,
  restaurantName: null,
  liveOrders: false,
  minOrderCents: null,
  deliveryFeeCents: 0,
  leadHours: 24,
  event: defaultCateringEvent(),
  lines: [],
});

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
