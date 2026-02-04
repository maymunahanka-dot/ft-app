import { useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import { useUserStore } from "../stores/userSlice";
import { checkSubscriptionStatus } from "../utils/subscription";

type UseSubscriptionGuardProps = {
  email?: string;
  uuid?: string;
  paymentUrl: string;
};

export const useSubscriptionGuard = ({
  email,
  uuid,
  paymentUrl,
}: UseSubscriptionGuardProps) => {
  const hasCheckedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (hasCheckedRef.current && !user) return;
    hasCheckedRef.current = true;

    const runCheck = async () => {
      try {
        if (!email && !uuid) {
          setLoading(false);
          return;
        }

        const result = await checkSubscriptionStatus(email, uuid);

        setIsSubscribed(result.isSubscribed);
        setLoading(false);

        if (!result.isSubscribed) {
          // Redirect user to payment page
          Linking.openURL(paymentUrl);
        }
      } catch (err) {
        setLoading(false);
        Linking.openURL(paymentUrl);
      }
    };

    runCheck();
  }, [user]);

  return {
    loading,
    isSubscribed,
  };
};
