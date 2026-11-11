import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserStore } from "../stores/userSlice";
import { checkSubscriptionStatus } from "../utils/subscription";

/** Free trial length — keep in step with the backend's config/trial.js. */
const TRIAL_DAYS = 3;

/**
 * Screens that stay open on the free plan (no active trial or subscription).
 * Keep in step with the web app's FREE_PLAN_FEATURES. The backend caps
 * clients and invoices at 10 each for free accounts.
 */
const FREE_ROUTES: (string | RegExp)[] = [
  "/Dashboard",
  "/Clients",
  "/Invoices",
  "/More", // account, settings, sign out
  /^\/protected\/client\//,
  /^\/protected\/invoice\//,
  "/protected/invoice-preview",
  "/protected/form/create-client",
  "/protected/form/create-invoice",
  /^\/protected\/more\//, // profile, security, subscription details
  "/protected/subscription-modal",
  "/payment-complete", // back from the web pay page
  "/protected/ticketing", // support
  "/protected/notifications",
];

export const isFreeRoute = (pathname: string) => {
  const path = pathname.split("?")[0];
  if (path === "/" || !path.startsWith("/") || path.startsWith("/sign") || path.startsWith("/screen")) return true;
  return FREE_ROUTES.some((r) => (typeof r === "string" ? path === r : r.test(path)));
};

const resolveCreatedAt = (createdAt: any): Date | null => {
  if (!createdAt) return null;
  if (typeof createdAt?.toDate === "function") return createdAt.toDate();
  if (typeof createdAt?.seconds === "number") {
    return new Date(createdAt.seconds * 1000);
  }
  const d = new Date(createdAt);
  return isNaN(d.getTime()) ? null : d;
};

type UseSubscriptionGuardProps = {
  email?: string;
  uuid?: string;
  paymentUrl: string;
  /** Current route; locked routes send free users to the subscribe screen. */
  pathname?: string;
  /**
   * If true, redirect to the subscribe screen when a free user opens a locked screen
   * @default true
   */
  autoRedirect?: boolean;
};

export const useSubscriptionGuard = ({
  email,
  uuid,
  paymentUrl,
  pathname = "",
  autoRedirect = true,
}: UseSubscriptionGuardProps) => {
  const lastCheckedKeyRef = useRef("");
  const isCheckingRef = useRef(false);

  const [state, setState] = useState({
    loading: true,
    isSubscribed: false,
  });

  const hasUser = useUserStore((state) => !!state.user);
  const user = useUserStore((state) => state.user);

  const runCheck = useCallback(
    async (resolvedEmail: string, resolvedUuid: string) => {
      if (isCheckingRef.current) return;
      try {
        isCheckingRef.current = true;
        if (!resolvedEmail && !resolvedUuid) {
          setState({ loading: false, isSubscribed: false });
          return;
        }

        const result = await checkSubscriptionStatus(resolvedEmail, resolvedUuid);
        console.log("Subscription status:", result);

        if (result.isSubscribed) {
          setState({ loading: false, isSubscribed: true });
          return;
        }

        // Not subscribed — brand-new accounts still get in for the length of the free trial
        const createdAt = resolveCreatedAt(user?.createdAt);
        const daysSinceCreation = createdAt
          ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
          : Infinity;

        setState({ loading: false, isSubscribed: daysSinceCreation <= TRIAL_DAYS });
      } catch (err) {
        console.error("Subscription check failed:", err);
        setState({ loading: false, isSubscribed: false });
      } finally {
        isCheckingRef.current = false;
      }
    },
    [user?.createdAt],
  );

  useEffect(() => {
    if (!hasUser) {
      lastCheckedKeyRef.current = "";
      setState({ loading: false, isSubscribed: false });
      return;
    }

    const resolvedEmail = email || user?.email || "";
    const resolvedUuid = uuid || user?.uid || "";
    const checkKey = `${resolvedEmail}:${resolvedUuid}`;

    if (!resolvedEmail && !resolvedUuid) {
      setState((prev) => ({ ...prev, loading: true }));
      return;
    }

    if (lastCheckedKeyRef.current === checkKey) return;

    lastCheckedKeyRef.current = checkKey;
    runCheck(resolvedEmail, resolvedUuid);
  }, [email, hasUser, runCheck, user?.email, user?.uid, uuid]);

  // Free plan: only locked screens send the user to the subscribe screen.
  useEffect(() => {
    if (!autoRedirect || !hasUser || state.loading || state.isSubscribed) return;
    if (!pathname || isFreeRoute(pathname)) return;
    router.push({
      pathname: "/protected/subscription-modal",
      params: { email: email || user?.email || "", uuid: uuid || user?.uid || "", paymentUrl },
    });
  }, [autoRedirect, hasUser, state.loading, state.isSubscribed, pathname, email, uuid, paymentUrl, user?.email, user?.uid]);

  return state;
};
