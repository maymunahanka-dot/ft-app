import PrimaryButton from "@/src/components/button/PrimaryButton";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useAuth } from "@/src/hooks/auth";
import { scale, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export const redirectToExternalURL = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", `Don't know how to open this URL: ${url}`);
    }
  } catch (error) {
    console.error("An error occurred", error);
    Alert.alert("Error", "Failed to open the link. Please try again later.");
  }
};

const SignInScreen = () => {
  const paddingTop = useSafeAreaInsets().top;

  const { signIn, loading } = useAuth();
  console.log("auth loading", loading);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState({
    email: "",
    password: "",
  });
  const [isSecure, setIsSecure] = useState(true);

  const handleEmailChange = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setLoginData((prev) => ({ ...prev, email: text }));
    if (!text) {
      setLoginError((prev) => ({ ...prev, email: "Email is required" }));
    } else if (!emailRegex.test(text)) {
      setLoginError((prev) => ({ ...prev, email: "Email address is invalid" }));
    } else {
      setLoginError((prev) => ({ ...prev, email: "" }));
    }
  };
  const handlePasswordChange = (text: string) => {
    setLoginData((prev) => ({ ...prev, password: text }));
    if (!text) {
      setLoginError((prev) => ({ ...prev, password: "Password is required" }));
    } else if (text.length < 6) {
      setLoginError((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters long",
      }));
    } else {
      setLoginError((prev) => ({ ...prev, password: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: "",
      password: "",
    };
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!loginData.email?.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(loginData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // password validation
    if (!loginData.password?.trim() && loginData.password.length < 6) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setLoginError(newErrors);
    return isValid;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    try {
      const result = await signIn(loginData.email, loginData.password);
      if (result) {
        router.replace("/(tabs)/Dashboard");
      }
    } catch (error) {
      console.error("error in sign in", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        <ImageBackground
          source={require("@/assets/images/screen_bg.png")}
          style={[styles.headerBg, { paddingTop: paddingTop + spacing(20) }]}
        >
          <View style={styles.headerContent}>
            <View style={[styles.col, {}]}>
              <Text style={[Styles.bold32]}>Welcome Back To Business</Text>
              <Text style={[Styles.reg14]}>
                Access your dashboard and continue where you left off
              </Text>
            </View>

            <Text style={[Styles.bold12]}>
              Don’t have an account?{"  "}
              <Text
                style={[
                  Styles.med16,
                  {
                    color: Colors.secondary,
                    textDecorationLine: "underline",
                  },
                ]}
                onPress={() => router.replace("/sign-up")}
              >
                Sign up
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
              paddingBottom: spacing(30),
            }}
            keyboardDismissMode="interactive"
          >
            <View style={styles.content}>
              <View style={styles.inputsWrapper}>
                <View style={styles.inputs}>
                  {/* email */}
                  <View style={Styles.inputContainer}>
                    <Text style={Styles.label}>Email</Text>
                    <TextInput
                      value={loginData.email}
                      onChangeText={handleEmailChange}
                      placeholder="Email"
                      placeholderTextColor={Colors.grayText}
                      textContentType="emailAddress"
                      returnKeyLabel="next"
                      returnKeyType="next"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={Styles.input}
                    />
                    {loginError.email ? (
                      <Text
                        style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                      >
                        {loginError.email}
                      </Text>
                    ) : null}
                  </View>

                  {/* password */}
                  <View style={Styles.inputContainer}>
                    <Text style={Styles.label}>Password</Text>
                    <View style={Styles.input2}>
                      <TextInput
                        value={loginData.password}
                        onChangeText={handlePasswordChange}
                        placeholder="*****"
                        placeholderTextColor={Colors.grayText}
                        secureTextEntry={isSecure}
                        textContentType="password"
                        returnKeyLabel="done"
                        returnKeyType="done"
                        autoCorrect={false}
                        style={{
                          ...Styles.inputFontPadding,
                          flex: 1,
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setIsSecure(!isSecure)}
                        hitSlop={20}
                      >
                        {isSecure ? (
                          <EyeOff size={scale(15)} color={Colors.iconGrey} />
                        ) : (
                          <Eye size={scale(15)} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {loginError.password ? (
                      <Text
                        style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                      >
                        {loginError.password}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <Text
                  style={[
                    Styles.med12,
                    { textAlign: "right", color: Colors.secondary },
                  ]}
                  onPress={() =>
                    router.replace("/(auth)/screen/forget-password")
                  }
                >
                  Forgot Password ?
                </Text>
              </View>

              <View style={styles.footer}>
                <PrimaryButton
                  title="Log In"
                  onPress={handleContinue}
                  loading={loading}
                  // props={{ disabled: loading }}
                />
                <Text
                  style={[
                    Styles.med12,
                    { textAlign: "center", color: Colors.text.gray },
                  ]}
                >
                  By signing up, you agree to the{" "}
                  <Text
                    style={{ ...Styles.bold12, color: Colors.text.black }}
                    onPress={() =>
                      redirectToExternalURL(
                        "https://www.fashiontally.com/terms-of-service",
                      )
                    }
                  >
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={{ ...Styles.bold12, color: Colors.text.black }}
                    onPress={() =>
                      redirectToExternalURL(
                        "https://www.fashiontally.com/privacy-policy",
                      )
                    }
                  >
                    Data Processing Agreement
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "white",
  },
  headerBg: {
    height: "auto",
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
    gap: spacing(24),
    paddingTop: spacing(50),
  },
  inputs: {
    gap: spacing(16),
  },
  footer: {
    gap: spacing(32),
  },
});
