import OTPInput from "@/src/components/shared/auth/OTPInput";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { spacing } from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const VerifyOtpScreen = () => {
  const insets = useSafeAreaInsets();

  const { otp: paramOtp } = useLocalSearchParams();

  const generatedOtp = paramOtp.toString();

  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (otp.length === 6) {
      if (otp === generatedOtp) {
        router.replace("/(auth)/screen/store-details");
      }
    }
  }, [otp, generatedOtp]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        <ImageBackground
          // source={require("@/assets/images/Star_bg.png")}
          source={require("@/assets/images/screen_bg.png")}
          style={[styles.headerBg, { paddingTop: insets.top + spacing(20) }]}
        >
          <View style={styles.headerContent}>
            <Text style={[Styles.sm15, { color: Colors.secondary }]}>
              Step 2 Of 4
            </Text>
            <View style={[styles.col, {}]}>
              <Text style={[Styles.bold32]}>Verify Your Email</Text>
              <Text style={[Styles.reg14]}>
                Check your email for OTP to verify
              </Text>
            </View>

            <Text style={[Styles.bold12]}>
              Already have an account?{"  "}
              <Text
                style={[
                  Styles.med16,
                  {
                    color: Colors.secondary,
                    textDecorationLine: "underline",
                  },
                ]}
                onPress={() => router.replace("/sign-in")}
              >
                Sign in
              </Text>
            </Text>
          </View>
        </ImageBackground>
        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: "white",
          }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={
            Platform.OS === "ios" ? spacing(50) : spacing(0)
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: spacing(50),
            }}
            keyboardDismissMode="interactive"
          >
            <View style={styles.content}>
              <OTPInput value={otp} onChange={setOtp} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
  },
  headerBg: {
    backgroundColor: Colors.primary,
    padding: spacing(16),
    paddingBottom: spacing(50),
  },

  headerContent: {
    gap: spacing(8),
  },
  col: {
    gap: spacing(4),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing(16),
    paddingVertical: spacing(50),
    alignItems: "center",
  },
});
