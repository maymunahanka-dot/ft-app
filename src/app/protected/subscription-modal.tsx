import { useAuth } from "@/src/hooks/auth";
import { Colors } from "@/src/constants/theme";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { openPayPage } from "@/src/lib/payLink";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { checkSubscriptionStatus } from "../../utils/subscription";
import { Zap, LogOut, RefreshCw } from "lucide-react-native";

WebBrowser.maybeCompleteAuthSession();

export default function SubscriptionModal() {
  const router = useRouter();
  const { email, uuid } = useLocalSearchParams();
  const { signOut } = useAuth();
  const [checking, setChecking] = useState(false);

  const verify = async () => {
    setChecking(true);
    const res = await checkSubscriptionStatus(String(email), String(uuid));
    setChecking(false);
    if (res.isSubscribed) {
      router.back();
    }
  };

  useEffect(() => {
    verify();
  }, []);

  const [payError, setPayError] = useState("");

  /** Opens the web pay page already signed in as this user; re-checks the plan when it closes. */
  const handleManage = async () => {
    setPayError("");
    try {
      await openPayPage();
    } catch (err: any) {
      setPayError(err?.message ?? "Couldn't open the payment page. Please try again.");
    }
    await verify();
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView edges={["left","right","bottom"]} style={styles.container}>
      {checking ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <View style={styles.inner}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <Zap size={scale(36)} color={Colors.primary} fill={Colors.primary} />
          </View>

          {/* Text */}
          <Text style={styles.title}>Subscribe to unlock</Text>
          <Text style={styles.subtitle}>
            Your plan has ended. You can still use the Dashboard, Clients and Invoices (up to 10 of each).
            Choose a plan and pay to unlock everything.
          </Text>

          {/* Manage button */}
          <TouchableOpacity style={styles.manageBtn} onPress={handleManage}>
            <Text style={styles.manageBtnText}>Choose a plan & pay</Text>
          </TouchableOpacity>
          {!!payError && <Text style={{ color: "#e5484d", textAlign: "center", marginTop: spacing(8) }}>{payError}</Text>}

          {/* Refresh */}
          <TouchableOpacity style={styles.refreshRow} onPress={verify}>
            <RefreshCw size={scale(14)} color={Colors.text.gray} />
            <Text style={styles.refreshText}>Already renewed? Tap to refresh</Text>
          </TouchableOpacity>

          {/* Back to the free screens */}
          <TouchableOpacity
            style={styles.refreshRow}
            // Not router.back(): that would return to the locked screen and bounce here again
            onPress={() => router.replace("/(tabs)/Dashboard")}
          >
            <Text style={[styles.refreshText, { color: Colors.primary }]}>Back to Dashboard, Clients & Invoices</Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <LogOut size={scale(14)} color="rgba(220, 38, 38, 1)" />
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    alignItems: "center",
    paddingHorizontal: spacing(32),
    gap: spacing(12),
  },
  iconWrap: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(24),
    backgroundColor: Colors.plight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing(8),
  },
  title: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(24),
    color: "rgba(17, 24, 39, 1)",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: "rgba(108, 114, 120, 1)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing(8),
  },
  manageBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: spacing(14),
    paddingHorizontal: spacing(32),
    alignItems: "center",
    width: "100%",
  },
  manageBtnText: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(15),
    color: "white",
  },
  refreshRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(6),
    marginTop: spacing(4),
  },
  refreshText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(13),
    color: "rgba(108, 114, 120, 1)",
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(6),
    marginTop: spacing(8),
  },
  logoutText: {
    fontFamily: "medium",
    fontSize: scaleFontSize(13),
    color: "rgba(220, 38, 38, 1)",
  },
});
