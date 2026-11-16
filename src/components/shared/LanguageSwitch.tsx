/**
 * EN / FR switch at the top of the sign-in and sign-up screens, so people can pick their
 * language before they have an account. The pick is remembered on the phone, sent at
 * sign-up, and saved to the account after signing in.
 */
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Globe } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/src/constants/theme";
import { LANGUAGES, setAppLanguage } from "@/src/i18n";
import { scaleFontSize, spacing } from "@/src/utils/random";

/**
 * `saveToAccount`: signed-in screens also store the choice on the account.
 * `solid`: green pill, readable on both a green and a white header.
 */
export default function LanguageSwitch({ style, saveToAccount = false, solid = false }: { style?: ViewStyle; saveToAccount?: boolean; solid?: boolean }) {
  const { i18n } = useTranslation();
  const current = i18n.language === "fr" ? "fr" : "en";

  return (
    <View style={[styles.wrap, solid && styles.wrapSolid, style]} accessibilityRole="radiogroup" accessibilityLabel="Language / Langue">
      <Globe size={14} color="#fff" style={{ marginHorizontal: spacing(4) }} />
      {LANGUAGES.map((lang) => {
        const active = current === lang.code;
        return (
          <Pressable
            key={lang.code}
            onPress={() => setAppLanguage(lang.code, saveToAccount ? { saveToAccount: true } : { chosen: true })}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={lang.label}
            hitSlop={6}
            style={[styles.btn, active && styles.btnActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{lang.code.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    padding: spacing(3),
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  wrapSolid: { backgroundColor: Colors.primary, borderColor: "rgba(255,255,255,0.35)" },
  btn: {
    paddingVertical: spacing(5),
    paddingHorizontal: spacing(10),
    borderRadius: 999,
  },
  btnActive: { backgroundColor: "#fff" },
  label: { color: "#fff", fontSize: scaleFontSize(12), fontWeight: "700", letterSpacing: 0.5 },
  labelActive: { color: Colors.primary },
});
