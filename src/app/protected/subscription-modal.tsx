import PrimaryButton from "@/src/components/button/PrimaryButton";
import { useAuth } from "@/src/hooks/auth";
import { spacing } from "@/src/utils/random";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Text, View } from "react-native";
import { checkSubscriptionStatus } from "../../utils/subscription";

WebBrowser.maybeCompleteAuthSession();

export default function SubscriptionModal() {
  const router = useRouter();
  const { email, uuid, paymentUrl } = useLocalSearchParams();

  const { signOut } = useAuth();

  const [loading, setLoading] = useState(true);

  const openInDeviceBrowser = async () => {
    const targetUrl = String(paymentUrl || "");
    if (!targetUrl) {
      setLoading(false);
      return;
    }

    try {
      const supported = await Linking.canOpenURL(targetUrl);
      if (!supported) {
        throw new Error("External browser is not available");
      }

      await Linking.openURL(targetUrl);
      return;
    } catch (err) {
      console.error("Failed to open external browser:", err);
      setLoading(false);
      Alert.alert(
        "Open in your browser",
        `Please open this link in your browser:\n${targetUrl}`,
      );
    }
  };

  const openPayment = async () => {
    try {
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
    } catch (err) {
      console.error("Failed to open in-app browser:", err);
      await openInDeviceBrowser();
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
    // if (__DEV__) return;
    openPayment();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

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
      <View
        style={{
          width: "100%",
          paddingHorizontal: spacing(20),
          marginTop: spacing(20),
        }}
      >
        <PrimaryButton
          title="Logout"
          onPress={handleLogout}
          // loading={loading}
        />
      </View>
    </View>
  );
}
