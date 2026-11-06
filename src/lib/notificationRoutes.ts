import type { Href } from "expo-router";

/**
 * Screen each push notification `type` (set by the backend) opens when tapped.
 * Unknown types just open the app.
 */
const ROUTES: Record<string, Href> = {
  login:                  "/protected/more/security-details",
  password_changed:       "/protected/more/security-details",
  payment_success:        "/protected/more/subscription-details",
  subscription_cancelled: "/protected/more/subscription-details",
  plan_ending:            "/protected/more/subscription-details",
  plan_expired:           "/protected/more/subscription-details",
  team_member_added:      "/(tabs)/More",
  team_member_removed:    "/(tabs)/More",
  support_ticket:         "/protected/ticketing",
  low_stock:              "/(tabs)/Inventory",
  appointments:           "/(tabs)/Appointments",
  appointment_soon:       "/(tabs)/Appointments",
  pending_orders:         "/(tabs)/Orders",
  order_due:              "/(tabs)/Orders",
  order_overdue:          "/(tabs)/Orders",
  invoice_overdue:        "/(tabs)/Invoices",
};

export const routeForNotification = (data?: Record<string, unknown> | null): Href | null => {
  const type = typeof data?.type === "string" ? data.type : "";
  return ROUTES[type] ?? null;
};
