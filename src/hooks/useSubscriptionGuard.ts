import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import { useUserStore } from "../stores/userSlice";
import { checkSubscriptionStatus } from "../utils/subscription";

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

  const runCheck = useCallback(async () => {
    if (isCheckingRef.current) return;

    try {
      isCheckingRef.current = true;

      if (!email && !uuid) {
        setState({ loading: false, isSubscribed: false });
        return;
      }

      const result = await checkSubscriptionStatus(email, uuid);

      setState({
        loading: false,
        isSubscribed: result.isSubscribed,
      });

      console.log("Subscription status:", result);

      // Handle redirect
      if (!result.isSubscribed && autoRedirect) {
        router.push({
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
  }, [email, uuid, paymentUrl, autoRedirect]);

  useEffect(() => {
    if (hasCheckedRef.current || !hasUser) return;

    hasCheckedRef.current = true;
    runCheck();
  }, [hasUser, runCheck]);

  return state;
};
