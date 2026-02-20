import { HapticTab } from "@/src/components/haptic-tab";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
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

import PrimaryButton from "@/src/components/button/PrimaryButton";
import CountryModal from "@/src/components/shared/modal/CountryModal";
import { Roles, RolesType } from "@/src/constants/data";
import { useUserImage } from "@/src/hooks/useUserImage";
import { useAuthStore } from "@/src/stores/authSlice";
import { ChevronDown, MoveLeft, Upload } from "lucide-react-native";

const StoreDetailsScreen = () => {
  const insets = useSafeAreaInsets();

  const [selectedRole, setSelectedRole] = useState<RolesType>("Designer");
  const [showCountry, setShowCountry] = useState(false);
  const toggleCountryModal = () => setShowCountry((prev) => !prev);

  const { image, pickImage } = useUserImage({
    returnBase64: true,
    maxWidth: 256,
    compress: 0.4,
  });

  const [selectedCountry, setSelectedCountry] = useState("Nigeria");

  const [error, setError] = useState({
    businessName: "",
    country: "",
    logo: "",
  });

  const userData = useAuthStore((state) => state.userData);
  const updateUserData = useAuthStore((state) => state.updateUserData);

  const handleDataChange = (field: keyof typeof userData, value: string) => {
    updateUserData({ ...userData, [field]: value });
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    if (image) {
      handleDataChange("logo", image);
      //   console.log("image", image);
    }
  }, [image]);

  const handlePickImage = async () => {
    try {
      await pickImage();
    } catch (error) {
      console.error("error handling image", error);
    }
  };

  const validateForm = () => {
    const newErrors = {
      businessName: "",
      country: "",
      logo: "",
    };
    let isValid = true;

    // store Name validation
    if (!userData.businessName?.trim() && userData.businessName.length < 5) {
      newErrors.businessName = "Store name is required";
      isValid = false;
    }
    // logo validation
    if (!userData.logo) {
      newErrors.logo = "Logo image is required";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validateForm()) {
      router.push("/(auth)/screen/create-password");
      console.log("user data", JSON.stringify(userData, null, 2));
    } else {
      Alert.alert(
        "Validation Error",
        "Please fix the errors in the form before continuing.",
        [{ text: "OK" }],
      );
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
        <View style={styles.container}>
          <ImageBackground
            // source={require("@/assets/images/Star_bg.png")}
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
                Step 3 Of 4
              </Text>
              <View style={[styles.col, {}]}>
                <Text style={[Styles.bold32]}>
                  One Platform.{"\n"}Powering Business Growth
                </Text>
                <Text style={[Styles.reg14]}>Time to set up your Store.</Text>
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
                  onPress={() => router.push("/sign-in")}
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
                  <View style={Styles.inputContainer}>
                    <Text style={Styles.label}>I am a:</Text>
                    <View style={[styles.row, { gap: spacing(15) }]}>
                      {Roles.map((role, index) => (
                        <HapticTab
                          style={[
                            styles.roleBtn,
                            selectedRole === role.value
                              ? styles.roleSelected
                              : styles.borderBtn,
                          ]}
                          onPress={() => setSelectedRole(role.value as any)}
                          key={index}
                        >
                          <Text
                            style={[
                              Styles.med12,
                              selectedRole === role.value
                                ? { color: Colors.text.white }
                                : { color: Colors.text.black },
                            ]}
                          >
                            {role.label}
                          </Text>
                        </HapticTab>
                      ))}
                    </View>
                  </View>

                  {/* store Name */}
                  <View style={Styles.inputContainer}>
                    <Text style={Styles.label}>
                      Store Name<Text style={styles.red}> *</Text>
                    </Text>
                    <TextInput
                      value={userData.businessName}
                      onChangeText={(value) =>
                        handleDataChange("businessName", value)
                      }
                      placeholder="Enter your store name"
                      placeholderTextColor={Colors.grayText}
                      textContentType="name"
                      returnKeyLabel="next"
                      returnKeyType="next"
                      style={Styles.input}
                    />
                    {error.businessName ? (
                      <Text style={Styles.errorText}>{error.businessName}</Text>
                    ) : null}
                  </View>

                  {/* logo image */}
                  <View style={[Styles.inputContainer, { gap: spacing(12) }]}>
                    <Text style={[styles.reg14]}>
                      Logo<Text style={styles.red}> *</Text>
                    </Text>

                    <HapticTab
                      style={styles.imagePicker}
                      onPress={handlePickImage}
                    >
                      {image ? (
                        <Image
                          source={{ uri: `data:image/jpeg;base64,${image}` }}
                          style={{
                            width: "100%",
                            height: styles.imagePicker.height,
                            borderRadius: styles.imagePicker.borderRadius,
                          }}
                        />
                      ) : (
                        <>
                          <Upload size={scale(20)} color={"#99A1AF"} />

                          <View
                            style={[
                              styles.col,
                              {
                                justifyContent: "center",
                                alignItems: "center",
                              },
                            ]}
                          >
                            <Text style={styles.reg14}>
                              Click to Select Favicon
                            </Text>
                            {/* <Text style={styles.reg12}>PNG, JPG up to 10MB</Text> */}
                          </View>
                        </>
                      )}
                    </HapticTab>
                    {error.logo ? (
                      <Text
                        style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                      >
                        {error.logo}
                      </Text>
                    ) : null}
                  </View>

                  <View style={Styles.inputContainer}>
                    <Text style={Styles.label}>Country</Text>
                    <TouchableOpacity
                      onPress={toggleCountryModal}
                      style={[
                        Styles.input,
                        {
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <Text style={styles.textBtn}>{selectedCountry}</Text>
                      <ChevronDown size={scale(12)} color={"black"} />
                    </TouchableOpacity>
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
      {showCountry && (
        <CountryModal
          visible={showCountry}
          onClose={() => setShowCountry(false)}
          handleOption={(country) => {
            setSelectedCountry(country);
            handleDataChange("country", country);
          }}
        />
      )}
    </>
  );
};

export default StoreDetailsScreen;

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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  roleSelected: {
    backgroundColor: Colors.primary,
  },
  borderBtn: {
    borderWidth: 1,
    borderColor: Colors.iconGrey,
  },
  textBtn: {
    fontFamily: "regular",
  },
  reg12: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
    color: "#99A1AF",
  },
  reg14: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: "#4A5565",
  },
  red: {
    color: "rgba(251, 44, 54, 1)",
  },
  imagePicker: {
    height: 100,
    gap: spacing(12),
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DC",
    borderRadius: 16,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
