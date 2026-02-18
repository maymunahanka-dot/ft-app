import PrimaryButton from "@/src/components/button/PrimaryButton";
import { HapticTab } from "@/src/components/haptic-tab";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useAuth } from "@/src/hooks/auth";
import { useAuthStore } from "@/src/stores/authSlice";
import { scale, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { Eye, EyeOff, MoveLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
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

const CreatePasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const [isSecure, setIsSecure] = useState(true);
  const toggleVisiblity = () => setIsSecure((prev) => !prev);

  const { loading, signUp } = useAuth();

  const [details, setDetails] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState({
    password: "",
    confirmPassword: "",
  });

  const userData = useAuthStore((state) => state.userData);

  const handleDataChange = (field: keyof typeof details, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    // Password validation
    if (!details.password?.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (details.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    //  must match password
    if (!details.confirmPassword?.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (details.password !== details.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    try {
      await signUp(userData, details.password);
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleContinue = async () => {
    if (validateForm()) {
      await handleSignUp();
    } else {
      Alert.alert(
        "Validation Error",
        "Please fix the errors in the form before continuing.",
        [{ text: "OK" }],
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        <ImageBackground
          source={require("@/assets/images/screen_bg.png")}
          style={[styles.headerBg, { paddingTop: insets.top + spacing(20) }]}
        >
          <View style={styles.headerContent}>
            <HapticTab
              onPress={() => router.back()}
              hitSlop={20}
              style={{ paddingVertical: spacing(8) }}
            >
              <MoveLeft size={scale(20)} color={"white"} />
            </HapticTab>
            <Text style={[Styles.sm15, { color: Colors.secondary }]}>
              Step 3 Of 3
            </Text>
            <View style={[styles.col, {}]}>
              <Text style={[Styles.bold32]}>
                One Platform.{"\n"}Powering Business Growth
              </Text>
              <Text style={[Styles.reg14]}>
                Almost done. Just one more thing..
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
              <View style={styles.inputs}>
                {/* password */}
                <View style={Styles.inputContainer}>
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
                </View>

                {/* confirm password*/}
                <View style={Styles.inputContainer}>
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
                </View>
              </View>

              <View style={[styles.footer]}>
                <PrimaryButton
                  title="Launch Account"
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

export default CreatePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerBg: {
    height: "auto",
    backgroundColor: Colors.primary,
    padding: spacing(16),
    paddingBottom: spacing(20),
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
