import { Colors } from "@/src/constants/theme";
import { apiFetch } from "@/src/lib/apiClient";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Bell, ChevronLeft, Megaphone } from "lucide-react-native";
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

type Notification = {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  isRead: boolean;
};

const formatTime = (isoStr: string): string => {
  if (!isoStr) return "";
  const diff  = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function NotificationsScreen() {
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
      onPress={() => !item.isRead && markRead(item.id)}
    >
      <View style={styles.cardRow}>
        <View style={styles.iconWrap}>
          <Megaphone size={scale(18)} color={Colors.primary} />
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
            {item.title}
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
        <Text style={[styles.headerTitle, { color: textColor }]}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} hitSlop={12}>
            <Text style={styles.markAllText}>Mark all read</Text>
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
          <Text style={[styles.emptyText, { color: subColor }]}>No notifications yet</Text>
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
