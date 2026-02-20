import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import { useUserStore } from "../stores/userSlice";
import { checkSubscriptionStatus } from "../utils/subscription";

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
  /**
   * If true, automatically redirect to subscription modal when not subscribed
   * @default true
   */
  autoRedirect?: boolean;
};

export const useSubscriptionGuard = ({
  email,
  uuid,
  paymentUrl,
  autoRedirect = true,
}: UseSubscriptionGuardProps) => {
  const hasCheckedRef = useRef(false);
  const isCheckingRef = useRef(false);

  const [state, setState] = useState({
    loading: true,
    isSubscribed: false,
  });

  const hasUser = useUserStore((state) => !!state.user);
  const user = useUserStore((state) => state.user);

  const runCheck = useCallback(async () => {
    if (isCheckingRef.current) return;
    try {
      isCheckingRef.current = true;
      if (!email && !uuid) {
        setState({ loading: false, isSubscribed: false });
        return;
      }

      const result = await checkSubscriptionStatus(email, uuid);
      console.log("Subscription status:", result);

      if (result.isSubscribed) {
        setState({ loading: false, isSubscribed: true });
        return;
      }

      // Not subscribed — check 3-day creation grace period
      const createdAt = resolveCreatedAt(user?.createdAt);
      const daysSinceCreation = createdAt
        ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;

      if (daysSinceCreation <= 3) {
        console.log("Within 3-day trial grace period, allowing access");
        setState({ loading: false, isSubscribed: true });
        return;
      }

      setState({ loading: false, isSubscribed: false });

      if (autoRedirect) {
        router.replace({
          pathname: "/protected/subscription-modal",
          params: {
            email: email || "",
            uuid: uuid || "",
            paymentUrl,
          },
        });
      }
    } catch (err) {
      console.error("Subscription check failed:", err);
      setState({ loading: false, isSubscribed: false });
      Linking.openURL(paymentUrl).catch((linkErr) =>
        console.error("Failed to open payment URL:", linkErr),
      );
    } finally {
      isCheckingRef.current = false;
    }
  }, [email, uuid, paymentUrl, autoRedirect, user]);

  useEffect(() => {
    console.log("hasUser:", hasUser, "hasChecked:", hasCheckedRef.current);
    if (hasCheckedRef.current || !hasUser) return;

    hasCheckedRef.current = true;
    runCheck();
  }, [hasUser, runCheck]);

  return state;
};
