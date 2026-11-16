import PrimaryButton from "@/src/components/button/PrimaryButton";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { sendEmailOtp } from "@/src/lib/emailOtp";
import { useAuthStore } from "@/src/stores/authSlice";
import { ShowToastMessage, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";

import LanguageSwitch from "@/src/components/shared/LanguageSwitch";
const SignUpScreen = () => {
  const { t: tx } = useTranslation();
  const { top: statusBarHeight } = useSafeAreaInsets();
  const { isDark } = useTheme();

  const bg = isDark ? "#151718" : "white";
  const textColor = isDark ? Colors.text.white : Colors.text.black;
  const labelColor = isDark ? "rgba(180,180,180,1)" : Colors.label;
  const inputBg = isDark ? "rgba(30,30,30,1)" : "white";
  const inputBorder = isDark ? "rgba(60,60,60,1)" : Colors.inputBorder;
  const placeholderColor = isDark ? "rgba(100,100,100,1)" : Colors.grayText;

  const country = { dialCode: "+234" };

  const [error, setError] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const userData = useAuthStore((state) => state.userData);
  const updateUserData = useAuthStore((state) => state.updateUserData);

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const handleDataChange = (field: keyof typeof userData, value: string) => {
    updateUserData({ ...userData, [field]: value });
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { name: "", email: "", phone: "" };
    let isValid = true;

    if (!userData.name?.trim() && userData.name.length < 5) {
      newErrors.name = tx("auto.firstNameIsRequired_df38");
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email?.trim()) {
      newErrors.email = tx("auto.emailIsRequired_4da1");
      isValid = false;
    } else if (!emailRegex.test(userData.email.trim())) {
      newErrors.email = tx("auto.pleaseEnterAValidEmail_0802");
      isValid = false;
    }

    if (!userData.phone?.trim()) {
      newErrors.phone = tx("auto.phoneNumberIsRequired_f845");
      isValid = false;
    } else {
      const cleanedPhone = userData.phone.replace(/\D/g, "");
      if (cleanedPhone.length !== 10) {
        newErrors.phone = tx("auto.phoneNumberMustBeExactly_f69a");
        isValid = false;
      }
    }

    setError(newErrors);
    return isValid;
  };

  const focusFirstErrorField = () => {
    setTimeout(() => {
      if (error.name) nameRef.current?.focus();
      else if (error.email) emailRef.current?.focus();
      else if (error.phone) phoneRef.current?.focus();
    }, 100);
  };

  const handleContinue = async () => {
    setLoading(true);
    if (!validateForm()) {
      focusFirstErrorField();
      Alert.alert(tx("auto.validationError_a997"), tx("auto.pleaseFixTheErrorsIn_1e16"), [{ text: "OK" }]);
      setLoading(false);
      return;
    }
    try {
      const email = userData.email.trim().toLowerCase();
      // Any earlier verification was for the email as it was then
      updateUserData({ email, emailVerificationToken: undefined });
      await sendEmailOtp(email);
      router.push("/(auth)/verify-otp");
      ShowToastMessage({ title: tx("auto.otpSentToYourEmail_7c07"), from: "top", preset: "done" });
    } catch (err: any) {
      console.error("error sending email OTP", err);
      ShowToastMessage({ title: err?.message || tx("auto.networkErrorPleaseTryAgain_1e3d"), from: "top", preset: "error" });
    } finally {
      setLoading(false);
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
          <LanguageSwitch style={{ marginTop: -spacing(8), marginBottom: spacing(10) }} />
          <View style={styles.headerContent}>
            <Text style={[Styles.sm15, { color: Colors.secondary }]}>
              {tx("auto.step1Of4_dc5a")}
            </Text>
            <View style={styles.col}>
              <Text style={Styles.bold32}>{tx("auto.welcomeBackToBusiness_4147")}</Text>
              <Text style={Styles.reg14}>
                {tx("auto.setUpYourFashionTally_894b")}
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
            <View style={styles.inputsWrapper}>
              <View style={Styles.inputContainer}>
                <Text style={[Styles.label, { color: labelColor }]}>{tx("auto.name_709a")}</Text>
                <TextInput
                  ref={nameRef}
                  value={userData.name}
                  onChangeText={(text) => handleDataChange("name", text)}
                  placeholder={tx("auto.name_709a")}
                  placeholderTextColor={placeholderColor}
                  textContentType="name"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[Styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
                />
                {error.name ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>{error.name}</Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={[Styles.label, { color: labelColor }]}>{tx("auto.email_84ad")}</Text>
                <TextInput
                  ref={emailRef}
                  value={userData.email}
                  onChangeText={(text) => handleDataChange("email", text)}
                  placeholder={tx("auto.email_84ad")}
                  placeholderTextColor={placeholderColor}
                  textContentType="emailAddress"
                  returnKeyType="next"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[Styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
                />
                {error.email ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>{error.email}</Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={[Styles.label, { color: labelColor }]}>{tx("auto.phoneNumber_ab25")}</Text>
                <View style={[Styles.input2, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                  <View style={Styles.pickerBtn}>
                    <Text style={[Styles.countryFlag, { color: textColor }]}>{country.dialCode}</Text>
                  </View>
                  <TextInput
                    ref={phoneRef}
                    value={userData.phone}
                    onChangeText={(value) => {
                      let rawPhone = value;
                      if (rawPhone.startsWith("0") && rawPhone.length > 5) rawPhone = rawPhone.slice(1);
                      rawPhone = rawPhone.replace(/\D/g, "");
                      handleDataChange("phone", rawPhone);
                    }}
                    placeholder={tx("auto.enterYourPhoneNumber_2ec2")}
                    keyboardType="number-pad"
                    textContentType="telephoneNumber"
                    maxLength={10}
                    placeholderTextColor={placeholderColor}
                    style={{ ...Styles.inputFontPadding, flex: 1, color: textColor }}
                  />
                </View>
                {error.phone ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>{error.phone}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.footer}>
              <PrimaryButton title={tx("auto.continue_2e02")} onPress={handleContinue} loading={loading} />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

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
    gap: spacing(32),
  },
  inputsWrapper: {
    gap: spacing(16),
    paddingTop: spacing(50),
  },
  footer: {
    gap: spacing(32),
  },
});
