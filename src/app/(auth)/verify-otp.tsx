import OTPInput from "@/src/components/shared/auth/OTPInput";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { sendEmailOtp, verifyEmailOtp } from "@/src/lib/emailOtp";
import { useAuthStore } from "@/src/stores/authSlice";
import { ShowToastMessage, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";

const RESEND_SECONDS = 30;

const VerifyOtpScreen = () => {
  const { t: tx } = useTranslation();
  const { top: statusBarHeight } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const email = useAuthStore((state) => state.userData.email);
  const updateUserData = useAuthStore((state) => state.updateUserData);

  const bg = isDark ? "#151718" : "white";
  const subTextColor = isDark ? "rgba(180,180,180,1)" : Colors.grayText;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  // Check the code with the backend as soon as all 6 digits are in
  useEffect(() => {
    if (otp.length !== 6) return;
    let cancelled = false;
    (async () => {
      setVerifying(true);
      setError("");
      try {
        const token = await verifyEmailOtp(email, otp);
        if (cancelled) return;
        updateUserData({ emailVerificationToken: token });
        router.replace("/(auth)/screen/store-details");
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || tx("auto.couldNotVerifyTheCode_d3e0"));
          setOtp("");
        }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [otp, email, updateUserData]);

  const resend = async () => {
    setResending(true);
    setError("");
    try {
      await sendEmailOtp(email);
      setOtp("");
      setResendIn(RESEND_SECONDS);
      ShowToastMessage({ title: tx("auto.aNewCodeHasBeen_5670"), from: "top", preset: "done" });
    } catch (err: any) {
      setError(err?.message || tx("auto.couldNotResendTheCode_cab1"));
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.primary }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? spacing(50) : spacing(0)}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardDismissMode="interactive"
      >
        <ImageBackground
          source={require("@/assets/images/screen_bg.png")}
          style={[styles.headerBg, { paddingTop: statusBarHeight + spacing(20) }]}
        >
          <View style={styles.headerContent}>
            <Text style={[Styles.sm15, { color: Colors.secondary }]}>
              {tx("auto.step2Of4_4dd1")}
            </Text>
            <View style={styles.col}>
              <Text style={Styles.bold32}>{tx("auto.verifyYourAccount_ddee")}</Text>
              <Text style={Styles.reg14}>
                {tx("auto.enterThe6DigitCode_7084")}{" "}{email}
              </Text>
            </View>
            <Text style={Styles.bold12}>
              {tx("auto.alreadyHaveAnAccount_8559")}{"  "}
              <Text
                style={[Styles.med16, { color: Colors.secondary, textDecorationLine: "underline" }]}
                onPress={() => router.replace("/sign-in")}
              >
                {tx("auto.signIn_ada2")}
              </Text>
            </Text>
          </View>
        </ImageBackground>

        <View
          style={{
            flex: 1,
            backgroundColor: bg,
            marginTop: -30,
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
            paddingBottom: spacing(30),
          }}
        >
          <View style={styles.content}>
            <OTPInput value={otp} onChange={setOtp} disabled={verifying} />

            {verifying && <ActivityIndicator color={Colors.primary} />}
            {!!error && <Text style={[Styles.errorText, styles.center]}>{error}</Text>}

            {resendIn > 0 ? (
              <Text style={[Styles.reg14, styles.center, { color: subTextColor }]}>
                {tx("auto.didnTGetTheCode_ca15")}{" "}{resendIn}s
              </Text>
            ) : (
              <Text
                style={[Styles.med16, styles.center, { color: Colors.primary }]}
                onPress={resending || verifying ? undefined : resend}
              >
                {resending ? tx("auto.sending_c338") : tx("auto.resendCode_1d3c")}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  headerBg: {
    backgroundColor: Colors.primary,
    padding: spacing(16),
    paddingBottom: spacing(50),
  },
  headerContent: {
    gap: spacing(12),
  },
  col: {
    gap: spacing(4),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing(16),
    paddingVertical: spacing(50),
    alignItems: "center",
    gap: spacing(16),
  },
  center: {
    textAlign: "center",
  },
});
