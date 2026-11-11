import { HapticTab } from "@/src/components/haptic-tab";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { apiFetch } from "@/src/lib/apiClient";
import { openPayPage } from "@/src/lib/payLink";
import { useUserStore } from "@/src/stores/userSlice";
import { getSubscriptionSummary, type SubscriptionSummary, type UserDocData } from "@/src/utils/subscription";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronLeft,
  Lock,
  RefreshCw,
  Repeat,
  Sparkles,
  Zap,
} from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Brand greens (same as the website). */
const BRAND = Colors.primary; // rgba(22, 152, 141, 1)
const BRAND_DARK = "#0B4F49";
const BRAND_LIGHT = "#2BC4B4";
const DANGER = "#E5484D";

/** Same date format as the web subscription panel, e.g. "6 Nov 2026". */
const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A";

const INACTIVE_TITLE: Record<string, string> = {
  trial_ended: "Your free trial has ended",
  expired: "Your plan has expired",
  cancelled: "You don't have an active plan",
};

/** What stays open without a plan, and what a plan unlocks (matches the subscription guard). */
const FREE_FEATURES = ["Dashboard", "Up to 10 clients", "Up to 10 invoices"];
const PAID_FEATURES = ["Unlimited clients & invoices", "Orders & custom designs", "Inventory & finance", "Appointments & CRM"];

export default function SubscriptionDetailsScreen() {
  const user = useUserStore((state) => state.user);
  const [info, setInfo] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [payError, setPayError] = useState("");
  const { isDark } = useTheme();

  const c = {
    bg: isDark ? "#0b0d0d" : "#F6F8F8",
    card: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(15, 23, 42, 0.07)",
    text: isDark ? "#F3F3F1" : "#0F1A1A",
    sub: isDark ? "rgba(243,243,241,0.6)" : "rgba(15, 26, 26, 0.6)",
    tint: isDark ? "rgba(43,196,180,0.12)" : "rgba(22,152,141,0.09)",
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {
      // The backend sends a ready-made summary: exactly what the web panel shows.
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

  /** Opens the web pay page already signed in as this user, then refreshes when it closes. */
  const handleManage = async () => {
    setPayError("");
    setOpening(true);
    try {
      await openPayPage();
    } catch (err: any) {
      setPayError(err?.message ?? "Couldn't open the payment page. Please try again.");
    } finally {
      setOpening(false);
      fetchStatus();
    }
  };

  const isTrial = info?.status === "trial";
  // Share of the period still left (the bar shrinks as days pass), same as the web panel.
  const leftShare = info?.totalDays ? Math.max(0, Math.min(1, info.daysLeft / info.totalDays)) : 0;
  const lowOnDays = !!info?.isActive && info.daysLeft <= 3;

  const renderPayButton = (label: string) => (
    <>
      <TouchableOpacity activeOpacity={0.85} onPress={handleManage} disabled={opening} style={styles.payBtnWrap}>
        <LinearGradient
          colors={[BRAND_LIGHT, BRAND]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.payBtn, opening && { opacity: 0.7 }]}
        >
          {opening ? <ActivityIndicator color="white" /> : <Zap size={scale(16)} color="white" fill="white" />}
          <Text style={styles.payBtnText}>{opening ? "Opening checkout…" : label}</Text>
        </LinearGradient>
      </TouchableOpacity>
      {!!payError && <Text style={styles.errorText}>{payError}</Text>}
      <View style={styles.secureRow}>
        <Lock size={scale(11)} color={c.sub} />
        <Text style={[styles.secureText, { color: c.sub }]}>Secure payment with Flutterwave · no auto-renew</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, paddingTop: spacing(10), backgroundColor: c.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={styles.header}>
        <HapticTab
          style={[styles.backBtn, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.replace("/(tabs)/More")}
        >
          <ChevronLeft size={scale(20)} color={c.text} strokeWidth={1.8} />
        </HapticTab>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: c.text }]}>Subscription</Text>
          <Text style={[styles.subtitle, { color: c.sub }]}>Your plan and billing</Text>
        </View>
        <TouchableOpacity
          onPress={fetchStatus}
          style={[styles.backBtn, { backgroundColor: c.card, borderColor: c.border }]}
          accessibilityLabel="Refresh status"
        >
          <RefreshCw size={scale(16)} color={BRAND} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingTop: spacing(20), paddingBottom: spacing(40) }}
      >
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={BRAND} />
            </View>
          ) : !info?.isActive ? (
            <>
              {/* No active plan */}
              <View style={[styles.card, styles.centerCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={[styles.bigIcon, { backgroundColor: c.tint }]}>
                  <Sparkles size={scale(30)} color={BRAND} />
                </View>
                <Text style={[styles.inactiveTitle, { color: c.text }]}>
                  {info?.status === "expired" ? `Your ${info.plan} plan has expired` : INACTIVE_TITLE[info?.status ?? "cancelled"]}
                </Text>
                <Text style={[styles.inactiveSub, { color: c.sub }]}>
                  {info?.endDate && info.status !== "cancelled" ? `It ended on ${formatDate(info.endDate)}. ` : ""}
                  Pick a plan to unlock everything again.
                </Text>
                {renderPayButton("Choose a plan & pay")}
              </View>

              <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={[styles.sectionLabel, { color: c.sub }]}>STILL FREE</Text>
                {FREE_FEATURES.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <View style={[styles.featureDot, { backgroundColor: c.tint }]}>
                      <Check size={scale(12)} color={BRAND} strokeWidth={3} />
                    </View>
                    <Text style={[styles.featureText, { color: c.text }]}>{f}</Text>
                  </View>
                ))}
                <View style={[styles.divider, { backgroundColor: c.border }]} />
                <Text style={[styles.sectionLabel, { color: c.sub }]}>UNLOCK WITH A PLAN</Text>
                {PAID_FEATURES.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <View style={[styles.featureDot, { backgroundColor: c.tint }]}>
                      <Lock size={scale(11)} color={BRAND} />
                    </View>
                    <Text style={[styles.featureText, { color: c.text }]}>{f}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              {/* Plan hero card in brand green */}
              <LinearGradient
                colors={[BRAND_LIGHT, BRAND, BRAND_DARK]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <View style={styles.heroGlow} />
                <View style={styles.heroTop}>
                  <View style={styles.heroIcon}>
                    <Zap size={scale(18)} color="white" fill="white" />
                  </View>
                  <View style={styles.heroPill}>
                    <Text style={styles.heroPillText}>
                      {isTrial ? "Free trial" : info.billingCycle === "yearly" ? "Yearly" : "Monthly"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.heroLabel}>{isTrial ? "Trying" : "Current plan"}</Text>
                <Text style={styles.heroPlan}>{info.plan ?? "Free"}</Text>

                <View style={styles.heroDaysRow}>
                  <Text style={styles.heroDays}>{info.daysLeft}</Text>
                  <Text style={styles.heroDaysUnit}>
                    day{info.daysLeft === 1 ? "" : "s"} left of {info.totalDays}
                  </Text>
                </View>

                <View style={styles.heroTrack}>
                  <View style={[styles.heroFill, { width: `${leftShare * 100}%` as any }]} />
                </View>
                <Text style={styles.heroEnds}>
                  {isTrial ? "Trial ends" : "Ends"} {formatDate(info.endDate)}
                </Text>
              </LinearGradient>

              {lowOnDays && (
                <View style={[styles.notice, { backgroundColor: c.tint }]}>
                  <CalendarClock size={scale(16)} color={BRAND} />
                  <Text style={[styles.noticeText, { color: c.text }]}>
                    Only {info.daysLeft} day{info.daysLeft === 1 ? "" : "s"} left. Renew now to avoid losing access.
                  </Text>
                </View>
              )}

              {/* Details */}
              <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                <DetailRow
                  icon={<CalendarCheck size={scale(16)} color={BRAND} />}
                  label="Started"
                  value={formatDate(info.startDate)}
                  colors={c}
                />
                <View style={[styles.divider, { backgroundColor: c.border }]} />
                <DetailRow
                  icon={<CalendarClock size={scale(16)} color={BRAND} />}
                  label={isTrial ? "Trial ends" : "Ends"}
                  value={formatDate(info.endDate)}
                  colors={c}
                />
                <View style={[styles.divider, { backgroundColor: c.border }]} />
                <DetailRow
                  icon={<Repeat size={scale(16)} color={BRAND} />}
                  label="Auto-renew"
                  value="Off"
                  colors={c}
                />
              </View>

              {/* Pay */}
              <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={[styles.payTitle, { color: c.text }]}>
                  {isTrial ? "Ready to keep going?" : "Renew or switch plan"}
                </Text>
                <Text style={[styles.paySub, { color: c.sub }]}>
                  {isTrial
                    ? "Choose a plan before your trial ends to keep everything unlocked."
                    : "Add more time to your plan or move to a different one."}
                </Text>
                {renderPayButton(isTrial ? "Choose a plan & pay" : "Change or renew plan")}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  colors: { text: string; sub: string; tint: string };
}) {
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIcon, { backgroundColor: colors.tint }]}>{icon}</View>
      <Text style={[styles.detailLabel, { color: colors.sub }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(12),
    paddingHorizontal: spacing(16),
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(14),
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(22),
    lineHeight: scaleFontSize(28),
  },
  subtitle: {
    fontFamily: "regular",
    fontSize: scaleFontSize(13),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing(16),
    gap: spacing(14),
  },
  loadingBox: {
    flex: 1,
    paddingTop: spacing(80),
    alignItems: "center",
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: spacing(18),
    gap: spacing(12),
  },
  centerCard: {
    alignItems: "center",
    paddingVertical: spacing(26),
  },
  divider: {
    height: 1,
  },

  // Hero
  hero: {
    borderRadius: 26,
    padding: spacing(20),
    overflow: "hidden",
    gap: spacing(4),
  },
  heroGlow: {
    position: "absolute",
    right: -scale(60),
    top: -scale(60),
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing(14),
  },
  heroIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(13),
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroPill: {
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(5),
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  heroPillText: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(12),
    color: "white",
  },
  heroLabel: {
    fontFamily: "medium",
    fontSize: scaleFontSize(13),
    color: "rgba(255,255,255,0.8)",
  },
  heroPlan: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(30),
    lineHeight: scaleFontSize(38),
    color: "white",
  },
  heroDaysRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing(6),
    marginTop: spacing(14),
  },
  heroDays: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(34),
    lineHeight: scaleFontSize(40),
    color: "white",
  },
  heroDaysUnit: {
    fontFamily: "medium",
    fontSize: scaleFontSize(14),
    color: "rgba(255,255,255,0.85)",
  },
  heroTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
    marginTop: spacing(8),
  },
  heroFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "white",
  },
  heroEnds: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
    color: "rgba(255,255,255,0.85)",
    marginTop: spacing(8),
  },

  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(10),
    padding: spacing(14),
    borderRadius: 16,
  },
  noticeText: {
    flex: 1,
    fontFamily: "medium",
    fontSize: scaleFontSize(13),
    lineHeight: 19,
  },

  // Details
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(12),
  },
  detailIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  detailLabel: {
    flex: 1,
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
  },
  detailValue: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(14),
  },

  // Pay
  payTitle: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(17),
  },
  paySub: {
    fontFamily: "regular",
    fontSize: scaleFontSize(13),
    lineHeight: 20,
    marginTop: -spacing(6),
  },
  payBtnWrap: {
    alignSelf: "stretch",
    marginTop: spacing(4),
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(8),
    borderRadius: 16,
    paddingVertical: spacing(15),
  },
  payBtnText: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(15),
    color: "white",
  },
  errorText: {
    fontFamily: "medium",
    fontSize: scaleFontSize(12),
    color: DANGER,
    textAlign: "center",
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(5),
  },
  secureText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(11),
  },

  // No plan
  bigIcon: {
    width: scale(68),
    height: scale(68),
    borderRadius: scale(22),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing(4),
  },
  inactiveTitle: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(20),
    textAlign: "center",
  },
  inactiveSub: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    lineHeight: 21,
    textAlign: "center",
    marginBottom: spacing(6),
  },
  sectionLabel: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(11),
    letterSpacing: 1,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(10),
  },
  featureDot: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(8),
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
  },
});
