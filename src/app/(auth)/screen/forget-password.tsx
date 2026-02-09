import PrimaryButton from "@/src/components/button/PrimaryButton";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useAuth } from "@/src/hooks/auth";
import { spacing } from "@/src/utils/random";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const ForgetPasswordScreen = () => {
  const insets = useSafeAreaInsets();

  const { loading, sendResetEmail } = useAuth();

  const [error, setError] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // const [isSecure, setIsSecure] = useState(true);
  // const toggleVisiblity = () => setIsSecure((prev) => !prev);

  const [email, setEmail] = useState("");
  // const [details, setDetails] = useState({
  //   password: "",
  //   confirmPassword: "",
  // });

  // const handleDataChange = (field: keyof typeof details, value: string) => {
  //   setDetails((prev) => ({ ...prev, [field]: value }));
  //   if (error[field as keyof typeof error]) {
  //     setError((prev) => ({ ...prev, [field]: "" }));
  //   }
  // };

  const handleEmailChange = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmail(text);
    if (!text) {
      setError((prev) => ({ ...prev, email: "Email is required" }));
    } else if (!emailRegex.test(text)) {
      setError((prev) => ({ ...prev, email: "Email address is invalid" }));
    } else {
      setError((prev) => ({ ...prev, email: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // // Password validation
    // if (!details.password?.trim()) {
    //   newErrors.password = "Password is required";
    //   isValid = false;
    // } else if (details.password.length < 6) {
    //   newErrors.password = "Password must be at least 6 characters";
    //   isValid = false;
    // }

    // //  must match password
    // if (!details.confirmPassword?.trim()) {
    //   newErrors.confirmPassword = "Please confirm your password";
    //   isValid = false;
    // } else if (details.password !== details.confirmPassword) {
    //   newErrors.confirmPassword = "Passwords do not match";
    //   isValid = false;
    // }

    setError(newErrors);
    return isValid;
  };
  const handleContinue = async () => {
    if (!validateForm()) return;
    try {
      await sendResetEmail(email);
      // router.replace({
      //   pathname: "/(auth)/screen/email/[email]",
      //   params: {
      //     email: email,
      //     password: details.password,
      //   },
      // });
      router.replace("/sign-in");
    } catch (error) {
      console.error("error in send email", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        <ImageBackground
          source={require("@/assets/images/Star_bg.png")}
          style={[styles.headerBg, { paddingTop: insets.top + spacing(20) }]}
        >
          <View style={styles.headerContent}>
            <View style={[styles.col, {}]}>
              <Text style={[Styles.bold32]}>Recreate Your Password</Text>
              <Text style={[Styles.reg14]}>
                A reset link will be sent to your email.
              </Text>
            </View>

            {/* <Text style={[Styles.bold12]}>
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
            </Text> */}
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
              <View style={styles.inputs}>
                {/* email */}
                <View style={Styles.inputContainer}>
                  <Text style={Styles.label}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="Email"
                    placeholderTextColor={Colors.grayText}
                    textContentType="emailAddress"
                    returnKeyLabel="next"
                    returnKeyType="next"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[Styles.input, { paddingVertical: 0 }]}
                  />
                  {error.email ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.email}
                    </Text>
                  ) : null}
                </View>

                {/* password */}
                {/* <View style={Styles.inputContainer}>
                  <Text style={Styles.label}>Password</Text>
                  <View style={Styles.input2}>
                    <TextInput
                      value={details.password}
                      onChangeText={(value) =>
                        handleDataChange("password", value)
                      }
                      placeholder="*****"
                      secureTextEntry={isSecure}
                      textContentType="password"
                      placeholderTextColor={Colors.grayText}
                      returnKeyLabel="done"
                      returnKeyType="done"
                      autoCorrect={false}
                      style={{ flex: 1, ...Styles.inputFontPadding }}
                    />
                    <TouchableOpacity onPress={toggleVisiblity} hitSlop={20}>
                      {isSecure ? (
                        <EyeOff size={scale(15)} color={Colors.iconGrey} />
                      ) : (
                        <Eye size={scale(15)} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {error.password ? (
                    <Text style={Styles.errorText}>{error.password}</Text>
                  ) : null}
                </View> */}

                {/* confirm password*/}
                {/* <View style={Styles.inputContainer}>
                  <Text style={Styles.label}>Confirm Password</Text>
                  <View style={Styles.input2}>
                    <TextInput
                      value={details.confirmPassword}
                      onChangeText={(value) =>
                        handleDataChange("confirmPassword", value)
                      }
                      placeholder="*****"
                      secureTextEntry={isSecure}
                      placeholderTextColor={Colors.grayText}
                      textContentType="password"
                      returnKeyLabel="done"
                      returnKeyType="done"
                      autoCorrect={false}
                      style={{ flex: 1, ...Styles.inputFontPadding }}
                    />
                    <TouchableOpacity onPress={toggleVisiblity} hitSlop={20}>
                      {isSecure ? (
                        <EyeOff size={scale(15)} color={Colors.iconGrey} />
                      ) : (
                        <Eye size={scale(15)} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {error.confirmPassword ? (
                    <Text style={Styles.errorText}>
                      {error.confirmPassword}
                    </Text>
                  ) : null}
                </View> */}
              </View>

              <View style={[styles.footer]}>
                <PrimaryButton
                  title="Send Email"
                  onPress={handleContinue}
                  props={{ disabled: loading }}
                  loading={loading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ForgetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: spacing(16),
    backgroundColor: "white",
  },
  headerBg: {
    width: "100%",
    height: "auto",
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
    gap: spacing(32),
  },
  inputs: {
    paddingVertical: spacing(50),
    gap: spacing(16),
    // backgroundColor: "red",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
