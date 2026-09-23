export type UserRole =
  | "admin"
  | "restaurant_manager"
  | "office_admin"
  | "employee";

export type OfficeUserRole = "office_admin" | "employee";

export type ScheduleStatus =
  | "draft"
  | "open"
  | "closed"
  | "sent_to_restaurant"
  | "delivered"
  | "cancelled";

export type OrderStatus =
  | "pending_payment"
  | "authorized"
  | "paid"
  | "cancelled"
  | "failed";

export type PlatformFeeType = "flat" | "percentage" | "hybrid" | "per_entree";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export type BrandingStatus = "pending" | "approved" | "rejected";

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url?: string | null;
  branding_status?: BrandingStatus;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Office {
  id: string;
  name: string;
  slug: string | null;
  company_name: string | null;
  street_address: string;
  suite: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  delivery_instructions: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
  active: boolean;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price_cents: number;
  counts_as_entree?: boolean;
  active: boolean;
  available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DailyLunchSchedule {
  id: string;
  office_id: string;
  restaurant_id: string;
  lunch_date: string;
  order_opens_at: string;
  order_cutoff_at: string;
  delivery_at: string;
  status: ScheduleStatus;
  created_at: string;
  updated_at: string;
}

export interface WeeklyScheduleTemplate {
  id: string;
  office_id: string;
  day_of_week: number;
  restaurant_id: string;
  cutoff_time: string;
  delivery_time: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedPaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  card_brand: string | null;
  card_last4: string | null;
  exp_month: number | null;
  exp_year: number | null;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  schedule_id: string;
  office_id: string;
  restaurant_id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  subtotal_cents: number;
  tax_cents: number;
  platform_fee_cents: number;
  gratuity_cents?: number;
  restaurant_commission_cents?: number;
  stripe_processing_fee_cents?: number;
  total_cents: number;
  payout_due_cents: number;
  status: OrderStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  payment_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name_snapshot: string;
  base_price_cents: number;
  quantity: number;
  special_instructions: string | null;
  line_total_cents: number;
}

export interface PlatformSettings {
  id: string;
  platform_fee_type: PlatformFeeType;
  flat_fee_cents: number;
  percentage_bps: number;
  sales_tax_bps: number;
  restaurant_commission_bps?: number;
  stripe_fee_fixed_cents?: number;
  stripe_fee_bps?: number;
  advance_order_hours: number;
  created_at: string;
  updated_at: string;
}

export interface LunchAnnouncement {
  id: string;
  office_id: string;
  schedule_id: string | null;
  subject: string;
  headline: string | null;
  body_html: string;
  send_at: string;
  sent_at: string | null;
  status: "draft" | "scheduled" | "sent" | "cancelled";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartLine {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
  specialInstructions?: string;
}

export interface ProductionSheetItem {
  menuItemId: string | null;
  itemName: string;
  totalQuantity: number;
  orders: {
    orderId: string;
    customerName: string;
    quantity: number;
    specialInstructions: string | null;
  }[];
}

export interface AdminDashboardTotals {
  todaySchedules: number;
  paidOrderCount: number;
  totalSalesCents: number;
  monthPaidOrderCount: number;
  monthSalesCents: number;
  totalPlatformFeesCents: number;
  totalPayoutDueCents: number;
  ordersByRestaurant: {
    restaurantId: string;
    restaurantName: string;
    orderCount: number;
    salesCents: number;
  }[];
}
