import { HapticTab } from "@/src/components/haptic-tab";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { useBlockedDays } from "@/src/hooks/useBlockedDays";
import { isWeekendKey, toDateKey } from "@/src/utils/blockedDays";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BlockDaysScreen = () => {
  const { isDark } = useTheme();
  const { top } = useSafeAreaInsets();
  const { blocked, loading, saving, persist } = useBlockedDays();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [highlight, setHighlight] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const bg = isDark ? "#0f0f0f" : "white";
  const textColor = isDark ? Colors.text.white : "rgba(54, 65, 83, 1)";
  const subText = isDark ? "rgba(160,160,160,1)" : "rgba(106, 114, 130, 1)";
  const border = isDark ? "rgba(255,255,255,0.12)" : "rgba(229, 231, 235, 1)";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(248, 250, 252, 1)";

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const startPad = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: Array<number | null> = Array.from({ length: startPad }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) result.push(day);
    return result;
  }, [cursor]);

  const todayKey = toDateKey(today);
  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const toggleDate = async (key: string) => {
    if (blocked.blockWeekends && isWeekendKey(key) && !blocked.dates.includes(key)) return;
    const nextDates = blocked.dates.includes(key)
      ? blocked.dates.filter((item) => item !== key)
      : [...blocked.dates, key].sort();
    try {
      await persist({ blockWeekends: blocked.blockWeekends, dates: nextDates });
    } catch {
      // The hook already restored the previous days and showed the error.
    }
  };

  const toggleWeekends = async () => {
    try {
      await persist({ blockWeekends: !blocked.blockWeekends, dates: blocked.dates });
    } catch {
      // Restored by the hook.
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: top, backgroundColor: bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <HapticTab style={styles.back} onPress={() => router.back()}>
          <ChevronLeft size={scale(20)} color={textColor} strokeWidth={1.5} />
        </HapticTab>
        <Text style={[styles.title, { color: textColor }]}>Block days</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: spacing(40) }} />
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Pressable
            style={[styles.weekend, { borderColor: border, backgroundColor: cardBg }]}
            onPress={toggleWeekends}
            disabled={saving}
          >
            <View style={[styles.box, blocked.blockWeekends && styles.boxOn]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.weekendTitle, { color: textColor }]}>Block every weekend</Text>
              <Text style={[styles.note, { color: subText }]}>Saturday and Sunday cannot be booked</Text>
            </View>
          </Pressable>

          <View style={{ gap: spacing(8) }}>
            <Text style={[styles.label, { color: textColor }]}>Find a day</Text>
            <Pressable
              style={[styles.search, { borderColor: border, backgroundColor: bg }]}
              onPress={() => setPickerOpen(true)}
            >
              <Text style={{ color: highlight ? textColor : subText, fontFamily: "regular" }}>
                {highlight || "Search a date"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.month}>
            <Pressable
              style={[styles.monthBtn, { borderColor: border }]}
              onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            >
              <ChevronLeft size={scale(18)} color={textColor} />
            </Pressable>
            <Text style={[styles.monthLabel, { color: textColor }]}>{monthLabel}</Text>
            <Pressable
              style={[styles.monthBtn, { borderColor: border }]}
              onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            >
              <ChevronRight size={scale(18)} color={textColor} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={[styles.weekday, { color: subText }]}>{day}</Text>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (!day) return <View key={`empty-${index}`} style={styles.cell} />;
              const key = toDateKey(new Date(cursor.getFullYear(), cursor.getMonth(), day));
              const isBlocked = blocked.dates.includes(key) || (blocked.blockWeekends && isWeekendKey(key));
              return (
                <Pressable
                  key={key}
                  disabled={saving}
                  onPress={() => toggleDate(key)}
                  style={[
                    styles.cell,
                    styles.day,
                    { borderColor: border, backgroundColor: bg },
                    isBlocked && styles.blocked,
                    key === todayKey && styles.today,
                    key === highlight && styles.found,
                  ]}
                >
                  <Text style={[styles.dayText, { color: isBlocked ? "#b91c1c" : textColor }]}>{day}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.note, { color: subText }]}>
            {saving ? "Saving..." : "Click a day to block it. Click again to open it."}
          </Text>
        </ScrollView>
      )}

      {pickerOpen && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          value={highlight ? new Date(`${highlight}T12:00:00`) : new Date()}
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            if (event.type !== "dismissed" && date) {
              const key = toDateKey(date);
              setHighlight(key);
              setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
            }
            setPickerOpen(false);
          }}
        />
      )}
    </View>
  );
};

export default BlockDaysScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(8),
    paddingHorizontal: spacing(8),
  },
  back: { width: 32, aspectRatio: 1, justifyContent: "center", alignItems: "center" },
  title: { fontFamily: "regular", fontSize: scaleFontSize(24), lineHeight: 32 },
  body: { padding: spacing(16), gap: spacing(16), paddingBottom: spacing(40) },
  weekend: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing(12),
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing(14),
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginTop: 2,
  },
  boxOn: { backgroundColor: Colors.primary },
  weekendTitle: { fontFamily: "medium", fontSize: scaleFontSize(15) },
  label: { fontFamily: "medium", fontSize: scaleFontSize(14) },
  search: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing(12), height: 44, justifyContent: "center" },
  month: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthBtn: { width: 36, height: 36, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  monthLabel: { fontFamily: "medium", fontSize: scaleFontSize(16) },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  weekday: { width: "14.28%", textAlign: "center", fontFamily: "medium", fontSize: scaleFontSize(11), marginBottom: spacing(6) },
  cell: { width: "14.28%", aspectRatio: 1, padding: 3 },
  day: { borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  dayText: { fontFamily: "medium", fontSize: scaleFontSize(14) },
  blocked: { backgroundColor: "rgba(220, 38, 38, 0.14)", borderColor: "rgba(220, 38, 38, 0.45)" },
  today: { borderWidth: 2, borderColor: Colors.primary },
  found: { borderWidth: 2, borderColor: Colors.primary },
  note: { fontFamily: "regular", fontSize: scaleFontSize(13), lineHeight: 18 },
});
