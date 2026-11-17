/**
 * Language select (flag + name) at the top of the sign-in and sign-up screens, so people can
 * pick their language before they have an account. The pick is remembered on the phone,
 * sent at sign-up, and saved to the account after signing in.
 */
import { useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Check, ChevronDown } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/src/constants/theme";
import { LANGUAGES, setAppLanguage, type AppLanguage } from "@/src/i18n";
import { scaleFontSize, spacing } from "@/src/utils/random";

/**
 * `saveToAccount`: signed-in screens also store the choice on the account.
 * `solid`: green trigger, readable on both a green and a white header.
 */
export default function LanguageSwitch({ style, saveToAccount = false, solid = false }: { style?: ViewStyle; saveToAccount?: boolean; solid?: boolean }) {
  const { i18n } = useTranslation();
  const current: AppLanguage = i18n.language === "fr" ? "fr" : "en";
  const currentLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];
  const triggerRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, w, h) => {
      // the menu opens under the trigger, lined up with its right edge
      setMenuPos({ top: y + h + 6, right: x + w });
    });
  };

  const pick = (code: AppLanguage) => {
    setMenuPos(null);
    if (code !== current) setAppLanguage(code, saveToAccount ? { saveToAccount: true } : { chosen: true });
  };

  return (
    <View style={[styles.anchor, style]}>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel={`Language / Langue: ${currentLang.label}`}
        accessibilityState={{ expanded: !!menuPos }}
        hitSlop={6}
        style={[styles.trigger, solid && styles.triggerSolid]}
      >
        <Text style={styles.flag}>{currentLang.flag}</Text>
        <Text style={styles.triggerLabel}>{currentLang.label}</Text>
        <ChevronDown size={15} color="#fff" />
      </Pressable>

      <Modal visible={!!menuPos} transparent animationType="fade" onRequestClose={() => setMenuPos(null)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuPos(null)} accessibilityLabel="Close" />
        {menuPos && (
          <View
            accessibilityRole="menu"
            style={[styles.menu, { top: menuPos.top, left: Math.max(spacing(12), menuPos.right - MENU_WIDTH) }]}
          >
            {LANGUAGES.map((lang) => {
              const active = current === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => pick(lang.code)}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                >
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{lang.label}</Text>
                  {active && <Check size={16} color={Colors.primary} style={{ marginLeft: "auto" }} />}
                </Pressable>
              );
            })}
          </View>
        )}
      </Modal>
    </View>
  );
}

const MENU_WIDTH = 170;

const styles = StyleSheet.create({
  anchor: { alignSelf: "flex-end" },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(6),
    paddingVertical: spacing(7),
    paddingHorizontal: spacing(12),
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  triggerSolid: { backgroundColor: Colors.primary },
  flag: { fontSize: scaleFontSize(17) },
  triggerLabel: { color: "#fff", fontSize: scaleFontSize(13), fontWeight: "600" },
  menu: {
    position: "absolute",
    width: MENU_WIDTH,
    padding: spacing(4),
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(10),
    paddingVertical: spacing(10),
    paddingHorizontal: spacing(10),
    borderRadius: 8,
  },
  optionPressed: { backgroundColor: "rgba(0,0,0,0.05)" },
  optionLabel: { color: "#111827", fontSize: scaleFontSize(14), fontWeight: "500" },
  optionLabelActive: { color: Colors.primary, fontWeight: "700" },
});
