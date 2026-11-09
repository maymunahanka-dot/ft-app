import { apiFetch } from "../lib/apiClient";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type SubscriptionType = "trial" | "paid" | "free";

export type SubscriptionResult = {
  isSubscribed: boolean;
  planType?: string;
  subscriptionType?: SubscriptionType;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  currentDate?: string;
  paymentAmount?: number;
  paymentDate?: string;
};

/** What the backend's /user/get returns as `subscription` — the same summary the web app shows. */
export type SubscriptionSummary = {
  status: "trial" | "active" | "trial_ended" | "expired" | "cancelled";
  isActive: boolean;
  plan: string;
  billingCycle: "monthly" | "yearly" | null;
  startDate: string | null;
  endDate: string | null;
  totalDays: number;
  daysLeft: number;
  daysUsed: number;
  autoRenews: boolean;
};

export type UserDocData = {
  subscriptionType?: SubscriptionType;
  planType?: string;
  isTrialActive?: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  trialStartDate?: string;
  billingCycle?: "monthly" | "yearly";
  payment_amount?: number | null;
  payment_date?: string | null;
  isSubscribed?: boolean;
  subscription?: SubscriptionSummary;
};

/* -------------------------------------------------------------------------- */
/*                 SUMMARY (same rules as the backend's summary)               */
/* -------------------------------------------------------------------------- */

const DAY_MS = 24 * 60 * 60 * 1000;
/** Keep in step with Fashiontally_Backend/config/trial.js */
const TRIAL_DAYS = 3;
const PLAN_PRICES: Record<string, number> = { STARTER: 5000, GROWTH: 10000, PROFESSIONAL: 15000 };
const YEARLY_PLAN_PRICES: Record<string, number> = { STARTER: 50000, GROWTH: 100000, PROFESSIONAL: 150000 };

const toMs = (value?: string | null) => {
  const ms = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(ms) ? ms : NaN;
};
const planName = (plan?: string | null) =>
  plan ? plan.trim().charAt(0).toUpperCase() + plan.trim().slice(1).toLowerCase() : null;
const planFromAmount = (amount?: number | null) => {
  const match = Object.entries(PLAN_PRICES)
    .sort((a, b) => b[1] - a[1])
    .find(([, price]) => Number(amount || 0) >= price);
  return match ? planName(match[0]) : null;
};

/**
 * The backend sends this summary ready-made; this local copy is only used when
 * talking to an older backend that doesn't send it yet, so both stay identical.
 */
export function getSubscriptionSummary(u: UserDocData | null | undefined): SubscriptionSummary {
  if (u?.subscription) return u.subscription;
  const d = u ?? {};
  const now = Date.now();
  const isTrial = d.subscriptionType === "trial";
  const isPaid = d.subscriptionType === "paid" || (!d.subscriptionType && Number(d.payment_amount) > 0);

  let endMs = toMs(d.subscriptionEndDate);
  if (!Number.isFinite(endMs) && Number(d.payment_amount) > 0 && Number.isFinite(toMs(d.payment_date))) {
    endMs = toMs(d.payment_date) + 30 * DAY_MS;
  }

  let billingCycle: "monthly" | "yearly" | null = null;
  if (isPaid) {
    const yearly = YEARLY_PLAN_PRICES[String(d.planType || "").toUpperCase()];
    billingCycle = d.billingCycle ?? (yearly && Number(d.payment_amount) >= yearly ? "yearly" : "monthly");
  }
  const periodDays = isTrial ? TRIAL_DAYS : billingCycle === "yearly" ? 365 : 30;

  // Same rule as the backend: the saved start date only counts when billingCycle was saved with it.
  let startMs = isTrial
    ? toMs(d.trialStartDate)
    : (d.billingCycle && toMs(d.subscriptionStartDate)) || toMs(d.payment_date);
  if (Number.isFinite(endMs) && (!Number.isFinite(startMs) || startMs >= endMs)) {
    startMs = endMs - periodDays * DAY_MS;
  }

  const hasPeriod = Number.isFinite(endMs);
  const totalDays = hasPeriod ? Math.max(1, Math.round((endMs - startMs) / DAY_MS)) : 0;
  const switchedOff = d.subscriptionType === "free" || d.isSubscribed === false;
  const isActive = hasPeriod && !switchedOff && endMs > now;
  const daysLeft = isActive ? Math.min(totalDays, Math.ceil((endMs - now) / DAY_MS)) : 0;

  const status: SubscriptionSummary["status"] = isActive
    ? isTrial ? "trial" : "active"
    : d.subscriptionType === "free" ? "cancelled" : isTrial ? "trial_ended" : "expired";

  return {
    status,
    isActive,
    plan: status === "cancelled" ? "Free" : planName(d.planType) || planFromAmount(d.payment_amount) || "Free",
    billingCycle,
    startDate: hasPeriod ? new Date(startMs).toISOString() : null,
    endDate: hasPeriod ? new Date(endMs).toISOString() : null,
    totalDays,
    daysLeft,
    daysUsed: totalDays - daysLeft,
    autoRenews: false,
  };
}

/* -------------------------------------------------------------------------- */
/*                              CORE CHECK LOGIC                               */
/* -------------------------------------------------------------------------- */

/**
 * Checks subscription status by reading the user record from the backend
 * (MongoDB). Falls back to granting access if the backend is unreachable so
 * a network blip never locks users out.
 */
export async function checkSubscriptionStatus(
  _email?: string,
  _uuid?: string,
): Promise<SubscriptionResult> {
  try {
    // apiFetch attaches the stored Bearer token automatically
    const res = await apiFetch<{ success: boolean; data: UserDocData }>(
      "/user/get",
    );

    if (!res.success || !res.data) {
      return getFallbackAccess();
    }

    return evaluateSubscription(res.data);
  } catch {
    // Network error or 401 — fail open so connectivity issues don't block users
    return getFallbackAccess();
  }
}

/* -------------------------------------------------------------------------- */
/*                          SUBSCRIPTION EVALUATION                            */
/* -------------------------------------------------------------------------- */

function evaluateSubscription(data: UserDocData): SubscriptionResult {
  // Newer backends send the shared summary: use it so access matches what the screens show.
  if (data.subscription) {
    const s = data.subscription;
    return {
      isSubscribed: s.isActive,
      subscriptionType: s.status === "trial" ? "trial" : s.isActive ? "paid" : "free",
      planType: s.plan,
      subscriptionStartDate: s.startDate ?? undefined,
      subscriptionEndDate: s.endDate ?? undefined,
      currentDate: new Date().toISOString(),
    };
  }

  const {
    subscriptionType,
    planType,
    isTrialActive,
    subscriptionStartDate,
    subscriptionEndDate,
    payment_amount,
    payment_date,
    isSubscribed,
  } = data;

  // 🧪 Trial
  if (subscriptionType === "trial" && isTrialActive && subscriptionEndDate) {
    if (isFutureDate(subscriptionEndDate)) {
      return {
        isSubscribed: true,
        subscriptionType: "trial",
        planType: planType ?? "Starter",
        subscriptionStartDate,
        subscriptionEndDate,
      };
    }
    return { isSubscribed: false, subscriptionType: "free", planType: "Free" };
  }

  // 🆕 New paid fields — check FIRST before legacy payment window
  // isSubscribed + subscriptionEndDate is the authoritative source of truth
  if (isSubscribed && subscriptionEndDate && isFutureDate(subscriptionEndDate)) {
    return {
      isSubscribed: true,
      subscriptionType: subscriptionType ?? "paid",
      planType: planType ?? "Starter",
      subscriptionStartDate,
      subscriptionEndDate,
      currentDate: new Date().toISOString(),
    };
  }

  // 💳 Legacy paid (30-day window) — only used when there is no subscriptionEndDate
  if (payment_amount && payment_amount > 0 && payment_date && !subscriptionEndDate) {
    const active = getDaysSince(payment_date) <= 30;
    return {
      isSubscribed: active,
      subscriptionType: "paid",
      planType: planType ?? determinePlanType(payment_amount),
      subscriptionStartDate: payment_date,
      subscriptionEndDate: getDatePlusDays(payment_date, 30),
      currentDate: new Date().toISOString(),
      paymentAmount: payment_amount,
      paymentDate: payment_date,
    };
  }

  return { isSubscribed: false, subscriptionType: "free", planType: "Free" };
}

/* -------------------------------------------------------------------------- */
/*                               UTIL FUNCTIONS                                */
/* -------------------------------------------------------------------------- */

const isFutureDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date > new Date();
};

const getDaysSince = (dateStr: string): number => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return Infinity;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
};

const getFallbackAccess = (): SubscriptionResult => ({
  isSubscribed: true,
  subscriptionType: "paid",
  planType: "All Access",
});

const determinePlanType = (amount: number): string => {
  if (amount >= 25000) return "PROFESSIONAL";
  if (amount >= 10000) return "GROWTH";
  if (amount >= 5000) return "STARTER";
  return "Free";
};

const getDatePlusDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};
