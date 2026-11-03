import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowUpDown, Check } from "lucide-react-native";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { SortOption } from "@/src/utils/sortBy";

export function useSavedSort(storageKey: string, fallback = "newest") {
  const [sortBy, setSortBy] = useState(fallback);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey)
      .then((saved) => {
        if (active && saved) setSortBy(saved);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [storageKey]);

  const updateSort = (value: string) => {
    setSortBy(value);
    AsyncStorage.setItem(storageKey, value).catch(() => {});
  };

  return [sortBy, updateSort] as const;
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
  borderColor?: string;
};

export default function SortByButton({ value, onChange, options, borderColor }: Props) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const textColor = isDark ? Colors.text.white : Colors.text.black;
  const line = borderColor || (isDark ? "rgba(255,255,255,0.1)" : "rgba(229, 231, 235, 1)");
  const sheetBg = isDark ? "#1a1a1a" : "white";

  return (
    <>
      <Pressable
        accessibilityLabel="Sort by"
        onPress={() => setOpen(true)}
        style={[styles.button, { borderColor: line, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "white" }]}
      >
        <ArrowUpDown size={scale(16)} color={textColor} />
        <Text style={[styles.label, { color: textColor }]}>Sort</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={() => {}}>
            <Text style={[styles.title, { color: textColor }]}>Sort by</Text>
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  style={styles.option}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: textColor, fontFamily: selected ? "medium" : "regular" }]}>
                    {option.label}
                  </Text>
                  {selected ? <Check size={scale(16)} color={Colors.primary} /> : <View style={{ width: scale(16) }} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing(12),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(6),
  },
  label: {
    fontFamily: "medium",
    fontSize: scaleFontSize(13),
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing(16),
    paddingTop: spacing(18),
    paddingBottom: spacing(28),
    gap: spacing(4),
  },
  title: {
    fontFamily: "medium",
    fontSize: scaleFontSize(16),
    marginBottom: spacing(8),
  },
  option: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontSize: scaleFontSize(15),
  },
});
