import { HapticTab } from "@/src/components/haptic-tab";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { apiFetch } from "@/src/lib/apiClient";
import { useUserStore } from "@/src/stores/userSlice";
import { getSubscriptionSummary, type SubscriptionSummary, type UserDocData } from "@/src/utils/subscription";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { ChevronLeft, RefreshCw, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAYMENT_URL = "https://www.fashiontally.com/login";

const STATUS_COLORS: Record<string, string> = {
  active: Colors.primary,
  trial: "rgba(82, 135, 61, 1)",
  inactive: "rgba(153, 161, 175, 1)",
};

/** Same date format as the web subscription panel, e.g. "6 Nov 2026". */
const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const INACTIVE_TITLE: Record<string, string> = {
  trial_ended: "Your free trial has ended",
  expired: "Your plan has expired",
  cancelled: "You don't have an active plan",
};

export default function SubscriptionDetailsScreen() {
  const user = useUserStore((state) => state.user);
  const [info, setInfo] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  const bg = isDark ? "#0f0f0f" : "white";
  const textColor = isDark ? Colors.text.white : "rgba(54, 65, 83, 1)";
  const subTextColor = isDark ? "rgba(160,160,160,1)" : "rgba(54, 65, 83, 1)";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(249, 250, 251, 1)";
  const dividerColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(229, 231, 235, 1)";
  const progressTrackBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(229, 231, 235, 1)";
  const progressLabelColor = isDark ? "rgba(160,160,160,1)" : "rgba(108, 114, 120, 1)";
  const progressSubColor = isDark ? "rgba(120,120,120,1)" : "rgba(153, 161, 175, 1)";
  const upgradeCardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(229, 231, 235, 1)";
  const upgradeHintColor = isDark ? "rgba(160,160,160,1)" : "rgba(108, 114, 120, 1)";

  const fetchStatus = async () => {
    setLoading(true);
    try {
      // The backend sends a ready-made summary — exactly what the web panel shows.
      const res = await apiFetch<{ success: boolean; data: UserDocData }>("/user/get");
      setInfo(getSubscriptionSummary(res.data));
    } catch (err: any) {
      console.warn("[subscription] backend fetch failed:", err?.message ?? err);
      // Offline: work it out from the user saved at login, with the same rules.
      setInfo(user ? getSubscriptionSummary(user as unknown as UserDocData) : null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleManage = async () => {
    try {
      const result = await WebBrowser.openBrowserAsync(PAYMENT_URL, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        showTitle: true,
      });
      if (result.type === "dismiss" || result.type === "cancel") {
        fetchStatus();
      }
    } catch {
      // fallback handled silently
    }
  };

  const statusColor =
    STATUS_COLORS[info?.status === "trial" ? "trial" : info?.isActive ? "active" : "inactive"];
  // Share of the period still left (the bar shrinks as days pass) — same as the web panel.
  const leftShare = info?.totalDays ? info.daysLeft / info.totalDays : 0;

  return (
    <SafeAreaView edges={["left","right","bottom"]} style={{ flex: 1, paddingTop: spacing(20), backgroundColor: bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Header */}
      <View style={styles.header}>
        <HapticTab style={styles.backBtn} onPress={() => router.replace("/(tabs)/More")}>
          <ChevronLeft size={scale(20)} color={isDark ? "rgba(200,200,200,1)" : "rgba(54, 65, 83, 1)"} strokeWidth={1.5} />
        </HapticTab>
        <View style={styles.col}>
          <Text style={[styles.title, { color: textColor }]}>Subscription</Text>
          <Text style={[Styles.reg14, { color: subTextColor }]}>
            Manage your subscription plan
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: spacing(30) }}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : !info?.isActive ? (
            <View style={styles.expiredBox}>
              <View style={styles.expiredIconWrap}>
                <Zap size={scale(32)} color={Colors.primary} fill={Colors.primary} />
              </View>
              <Text style={[styles.expiredTitle, { color: textColor }]}>
                {info?.status === "expired"
                  ? `Your ${info.plan} plan has expired`
                  : INACTIVE_TITLE[info?.status ?? "cancelled"]}
              </Text>
              <Text style={[styles.expiredSub, { color: upgradeHintColor }]}>
                {info?.endDate && info.status !== "cancelled" ? `It ended on ${formatDate(info.endDate)}. ` : ""}
                Log in on the web to choose a plan and keep using FashionTally.
              </Text>
              <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: Colors.primary, width: "100%" }]} onPress={handleManage}>
                <Zap size={scale(15)} color="white" fill="white" />
                <Text style={styles.upgradeBtnText}>Renew Subscription</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.refreshRow} onPress={fetchStatus}>
                <RefreshCw size={scale(13)} color={Colors.text.gray} />
                <Text style={[Styles.reg12, { color: Colors.text.gray }]}>Refresh status</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Plan card */}
              <View style={[styles.card, { backgroundColor: cardBg }]}>
                <View style={styles.planRow}>
                  <View style={[styles.planIconBg, { backgroundColor: statusColor + "18" }]}>
                    <Zap size={scale(18)} color="#fff" fill={statusColor} />
                  </View>
                  <View style={styles.col}>
                    <Text style={[styles.planName, { color: textColor }]}>
                      {info?.plan ?? "Free"}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: statusColor + "18" }]}>
                      <Text style={[styles.badgeText, { color: statusColor }]}>
                        {info?.status === "trial"
                          ? "Trial"
                          : info?.billingCycle === "yearly"
                          ? "Yearly"
                          : "Monthly"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: dividerColor }]} />

                <View style={styles.progressSection}>
                  <View style={styles.progressLabelRow}>
                    <Text style={[styles.progressLabel, { color: progressLabelColor }]}>Days remaining</Text>
                    <Text style={[styles.progressCount, { color: statusColor }]}>
                      {info?.daysLeft ?? 0} of {info?.totalDays ?? 0} days
                    </Text>
                  </View>

                  <View style={[styles.progressTrack, { backgroundColor: progressTrackBg }]}>
                    <View
                      style={[styles.progressFill, { width: `${leftShare * 100}%` as any, backgroundColor: statusColor }]}
                    />
                  </View>

                  <Text style={[styles.progressSub, { color: progressSubColor }]}>
                    {info?.status === "trial" ? "Trial ends on" : "Ends on"} {formatDate(info?.endDate ?? null)}
                    {info?.status === "trial" ? "" : " · doesn't renew automatically"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.refreshRow} onPress={fetchStatus}>
                <RefreshCw size={scale(13)} color={Colors.text.gray} />
                <Text style={[Styles.reg12, { color: Colors.text.gray }]}>Refresh status</Text>
              </TouchableOpacity>

              <View style={[styles.upgradeCard, { borderColor: upgradeCardBorder }]}>
                <Text style={[styles.upgradeHint, { color: upgradeHintColor }]}>
                  Log in to the web to upgrade, downgrade, or cancel your subscription.
                </Text>
                <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: statusColor }]} onPress={handleManage}>
                  <Zap size={scale(15)} color="white" fill="white" />
                  <Text style={styles.upgradeBtnText}>Manage on Web</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: spacing(8),
    paddingHorizontal: spacing(16),
    paddingVertical: spacing(6),
  },
  backBtn: {
    width: 32,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  col: {
    gap: spacing(4),
  },
  title: {
    fontFamily: "regular",
    fontSize: scaleFontSize(24),
    lineHeight: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing(16),
    gap: spacing(16),
  },
  card: {
    borderRadius: 20,
    padding: spacing(20),
    gap: spacing(16),
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(12),
  },
  planIconBg: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
  },
  planName: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(18),
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing(10),
    paddingVertical: spacing(3),
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: "medium",
    fontSize: scaleFontSize(11),
  },
  divider: {
    height: 1,
  },
  progressSection: {
    gap: spacing(8),
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontFamily: "medium",
    fontSize: scaleFontSize(13),
  },
  progressCount: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(13),
  },
  progressTrack: {
    height: 8,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
  progressSub: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
  },
  refreshRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(5),
    alignSelf: "flex-end",
  },
  expiredBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(12),
    paddingHorizontal: spacing(16),
    paddingTop: spacing(40),
  },
  expiredIconWrap: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(20),
    backgroundColor: Colors.plight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing(4),
  },
  expiredTitle: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(22),
    textAlign: "center",
  },
  expiredSub: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing(8),
  },
  upgradeCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing(20),
    gap: spacing(14),
    marginTop: spacing(4),
  },
  upgradeHint: {
    fontFamily: "regular",
    fontSize: scaleFontSize(13),
    textAlign: "center",
    lineHeight: 20,
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(8),
    borderRadius: 14,
    paddingVertical: spacing(14),
  },
  upgradeBtnText: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(15),
    color: "white",
  },
});
