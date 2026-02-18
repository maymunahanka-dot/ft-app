import PrimaryButton from "@/src/components/button/PrimaryButton";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useAuthStore } from "@/src/stores/authSlice";
import { spacing } from "@/src/utils/random";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const SignUpScreen = () => {
  const insets = useSafeAreaInsets();
  const country = {
    code: "NG",
    dialCode: "+234",
    flag: "🇳🇬",
    name: "Nigeria",
  };

  const [error, setError] = useState({
    name: "",
    // lastName: "",
    email: "",
    phone: "",
  });

  const userData = useAuthStore((state) => state.userData);
  const updateUserData = useAuthStore((state) => state.updateUserData);

  const handleDataChange = (field: keyof typeof userData, value: string) => {
    updateUserData({ ...userData, [field]: value });
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const nameRef = useRef<TextInput>(null);
  // const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const focusFirstErrorField = () => {
    // Use setTimeout to ensure setError has completed
    setTimeout(() => {
      if (error.name) {
        nameRef.current?.focus();
      } else if (error.email) {
        emailRef.current?.focus();
      } else if (error.phone) {
        phoneRef.current?.focus();
      }
    }, 100);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      // firstName: "",
      name: "",
      email: "",
      phone: "",
    };
    let isValid = true;

    // Name validation
    if (!userData.name?.trim() && userData.name.length < 5) {
      newErrors.name = "First name is required";
      isValid = false;
    }
    // last Name validation
    // if (!userData.lastName?.trim() && userData.lastName.length < 5) {
    //   newErrors.lastName = "Last name is required";
    //   isValid = false;
    // }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email?.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(userData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Phone validation - 10 digits
    if (!userData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else {
      const cleanedPhone = userData.phone.replace(/\D/g, "");
      if (cleanedPhone.length !== 10) {
        newErrors.phone = "Phone number must be exactly 10 digits";
        isValid = false;
      }
    }

    setError(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateForm()) {
      router.replace("/(auth)/screen/store-details");
    } else {
      focusFirstErrorField();
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
          // source={require("@/assets/images/Star_bg.png")}
          source={require("@/assets/images/screen_bg.png")}
          style={[styles.headerBg, { paddingTop: insets.top + spacing(20) }]}
        >
          <View style={styles.headerContent}>
            <Text style={[Styles.sm15, { color: Colors.secondary }]}>
              Step 1 Of 3
            </Text>
            <View style={[styles.col, {}]}>
              <Text style={[Styles.bold32]}>Welcome Back To Business</Text>
              <Text style={[Styles.reg14]}>
                Set up your Fashion Tally account today!
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
                {/* first name */}
                <View style={Styles.inputContainer}>
                  <Text style={Styles.label}>Name</Text>
                  <TextInput
                    ref={nameRef}
                    value={userData.name}
                    onChangeText={(text) => handleDataChange("name", text)}
                    placeholder="Name"
                    placeholderTextColor={Colors.grayText}
                    textContentType="name"
                    returnKeyLabel="next"
                    returnKeyType="next"
                    keyboardType="default"
                    autoCorrect={false}
                    style={Styles.input}
                  />
                  {error.name ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.name}
                    </Text>
                  ) : null}
                </View>

                {/* last name
                <View style={Styles.inputContainer}>
                  <Text style={Styles.label}>Last Name</Text>
                  <TextInput
                    ref={lastNameRef}
                    value={userData.lastName}
                    onChangeText={(text) => handleDataChange("lastName", text)}
                    placeholder="Last Name"
                    placeholderTextColor={Colors.grayText}
                    textContentType="name"
                    returnKeyLabel="next"
                    returnKeyType="next"
                    keyboardType="default"
                    autoCorrect={false}
                    style={Styles.input}
                  />
                  {error.lastName ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.lastName}
                    </Text>
                  ) : null}
                </View> */}

                {/* email */}
                <View style={Styles.inputContainer}>
                  <Text style={Styles.label}>Email</Text>
                  <TextInput
                    ref={emailRef}
                    value={userData.email}
                    onChangeText={(text) => handleDataChange("email", text)}
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
                  {error.email ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.email}
                    </Text>
                  ) : null}
                </View>

                {/* phone number */}
                <View style={Styles.inputContainer}>
                  <Text style={Styles.label}>Phone Number</Text>
                  <View style={Styles.input2}>
                    <View style={Styles.pickerBtn}>
                      <Text style={[Styles.countryFlag]}>
                        {country.dialCode}
                      </Text>
                    </View>
                    <TextInput
                      ref={phoneRef}
                      value={userData.phone}
                      onChangeText={(value) => {
                        let rawPhone = value;
                        if (rawPhone.startsWith("0") && rawPhone.length > 5) {
                          rawPhone = rawPhone.slice(1);
                        }
                        rawPhone = rawPhone.replace(/\D/g, "");
                        handleDataChange("phone", rawPhone);
                      }}
                      placeholder="Enter your Phone number"
                      keyboardType="number-pad"
                      textContentType="telephoneNumber"
                      maxLength={10}
                      placeholderTextColor={Colors.grayText}
                      style={{ ...Styles.inputFontPadding, flex: 1 }}
                    />
                  </View>
                  {error.phone ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.phone}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={[styles.footer]}>
                <PrimaryButton title="Continue" onPress={handleContinue} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;

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
    gap: spacing(32),
  },
  inputs: {
    paddingVertical: spacing(50),
    gap: spacing(16),
    // backgroundColor: "red",
  },
  footer: {
    // flex: 1,
    // justifyContent: "flex-end",
    // backgroundColor: "black",
    // paddingHorizontal: spacing(16),
  },
});
