import { Colors } from "@/src/constants/theme";
import { apiFetch } from "@/src/lib/apiClient";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Bell, CalendarClock, ChevronLeft, CircleAlert, CircleCheck, CircleX, Megaphone } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/ThemeContext";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";

import { dateLocale } from "@/src/i18n/dateLocale";
import { tl } from "@/src/i18n";
type Notification = {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  isRead: boolean;
  /** "broadcast", or a payment/plan type such as "payment_success" */
  type?: string;
};

/** Icon and colour per type; anything else is an announcement. */
const TYPE_ICON: Record<string, { Icon: typeof Megaphone; color: string }> = {
  payment_success: { Icon: CircleCheck, color: Colors.primary },
  plan_ending: { Icon: CalendarClock, color: "#D97706" },
  plan_expired: { Icon: CircleAlert, color: "#DC2626" },
  subscription_cancelled: { Icon: CircleX, color: "#DC2626" },
};
const isPlanNotice = (type?: string) => !!type && type in TYPE_ICON;

const formatTime = (isoStr: string): string => {
  if (!isoStr) return "";
  const diff  = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return tx("tpl.minsAgo", { n: mins });
  if (hours < 24) return tx("tpl.hoursAgo", { n: hours });
  if (days  < 7)  return tx("tpl.daysAgo", { n: days });
  return new Date(isoStr).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short" });
};

export default function NotificationsScreen() {
  const { t: tx } = useTranslation();
  const { isDark } = useTheme();
  const { top, bottom } = useSafeAreaInsets();

  const bg        = isDark ? "#0f0f0f" : "#f9fafb";
  const cardBg    = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const textColor = isDark ? Colors.text.white : Colors.text.black;
  const subColor  = isDark ? "rgba(160,160,160,1)" : "rgba(107,114,128,1)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(229,231,235,1)";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiFetch<{ success: boolean; data: Notification[] }>(
        "/admin/notifications/user/list"
      );
      if (data.success) setNotifications(data.data);
    } catch (e) {
      console.error("[Notifications] fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      await apiFetch(`/admin/notifications/user/read/${id}`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (e) {
      console.error("[Notifications] mark read error:", e);
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/admin/notifications/user/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("[Notifications] mark all read error:", e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderItem = ({ item }: { item: Notification }) => (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: item.isRead ? borderColor : Colors.primary,
          borderWidth: item.isRead ? 1 : 1.5,
        },
      ]}
      onPress={() => {
        if (!item.isRead) markRead(item.id);
        // Payment & plan notices open the subscription screen
        if (isPlanNotice(item.type)) router.push("/protected/more/subscription-details");
      }}
    >
      <View style={styles.cardRow}>
        <View style={styles.iconWrap}>
          {(() => {
            const { Icon, color } = TYPE_ICON[item.type ?? ""] ?? { Icon: Megaphone, color: Colors.primary };
            return <Icon size={scale(18)} color={color} />;
          })()}
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
            {tl(item.title)}
          </Text>
          <Text style={[styles.cardBody2, { color: subColor }]} numberOfLines={3}>
            {item.body}
          </Text>
          <Text style={[styles.cardTime, { color: subColor }]}>
            {formatTime(item.sentAt)}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: top + spacing(8), borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backBtn}>
          <ChevronLeft size={scale(22)} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>{tx("auto.notifications_753a")}</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} hitSlop={12}>
            <Text style={styles.markAllText}>{tx("auto.markAllRead_8958")}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: scale(60) }} />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Bell size={scale(48)} color={subColor} strokeWidth={1.2} />
          <Text style={[styles.emptyText, { color: subColor }]}>{tx("auto.noNotificationsYet_d260")}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: bottom + spacing(24) }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchNotifications(); }}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(16),
    paddingBottom: spacing(12),
    borderBottomWidth: 1,
  },
  backBtn: {
    width: scale(36), height: scale(36),
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(18),
  },
  markAllText: {
    fontFamily: "medium",
    fontSize: scaleFontSize(12),
    color: Colors.primary,
    width: scale(60),
    textAlign: "right",
  },
  list: {
    padding: spacing(16),
    gap: spacing(10),
  },
  card: {
    borderRadius: 14,
    padding: spacing(14),
    marginBottom: spacing(10),
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing(12),
  },
  iconWrap: {
    width: scale(38), height: scale(38),
    borderRadius: scale(10),
    backgroundColor: "rgba(22,152,141,0.12)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardBody: { flex: 1, gap: spacing(4) },
  cardTitle: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(14),
    lineHeight: 20,
  },
  cardBody2: {
    fontFamily: "regular",
    fontSize: scaleFontSize(13),
    lineHeight: 18,
  },
  cardTime: {
    fontFamily: "regular",
    fontSize: scaleFontSize(11),
    marginTop: spacing(2),
  },
  unreadDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: spacing(4),
    flexShrink: 0,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing(12),
  },
  emptyText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(15),
  },
});
