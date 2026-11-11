import { Colors } from "@/src/constants/theme";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * The web pay page's "Back to the app" button opens fashiontally://payment-complete.
 * Close the in-app browser and show the (now refreshed) subscription.
 */
export default function PaymentComplete() {
  useEffect(() => {
    try {
      WebBrowser.dismissBrowser();
    } catch {
      // browser already closed
    }
    router.replace("/protected/more/subscription-details");
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
