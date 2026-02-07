import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { checkSubscriptionStatus } from "../../utils/subscription";

WebBrowser.maybeCompleteAuthSession();

export default function SubscriptionModal() {
  const router = useRouter();
  const { email, uuid, paymentUrl } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);

  const openPayment = async () => {
    const browserResult = await WebBrowser.openBrowserAsync(
      String(paymentUrl),
      {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        showTitle: true,
      },
    );

    if (browserResult.type === "dismiss" || browserResult.type === "cancel") {
      await verify();
    }
  };

  const verify = async () => {
    const res = await checkSubscriptionStatus(String(email), String(uuid));

    if (res.isSubscribed) {
      router.back();
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    openPayment();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading && <ActivityIndicator size="large" />}
      <Text>Checking subscription...</Text>
    </View>
  );
}
