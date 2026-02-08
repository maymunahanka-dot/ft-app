import PrimaryButton from "@/src/components/button/PrimaryButton";
import { HapticTab } from "@/src/components/haptic-tab";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useAuth } from "@/src/hooks/auth";
import { useUserImage } from "@/src/hooks/useUserImage";
import { getCurrentUserEmail } from "@/src/lib/auth-utils";
import { useUserStore } from "@/src/stores/userSlice";
import { BrandSettings } from "@/src/types/auth";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { uploadImageToCloudinary } from "@/src/utils/uploadImageToCloudinary";
import { router } from "expo-router";
import { ChevronLeft, Pencil } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BrandDetailsScreen = () => {
  const brandSetting = useUserStore((state) => state.brandSetting);
  const editBrandSettings = useUserStore((state) => state.editBrandSettings);
  const fetchBrandSettings = useUserStore((state) => state.fetchBrandSettings);

  const { refreshUser } = useAuth();

  const [brandSettingData, setBrandSettingData] = useState<BrandSettings>({
    businessName: brandSetting?.businessName ?? "",
    businessAddress: brandSetting?.businessAddress ?? "",
    businessWebsite: brandSetting?.businessWebsite ?? "",
    logoUrl: brandSetting?.logoUrl ?? "",
    businessPhone: brandSetting?.businessPhone ?? "",
    footerText: brandSetting?.footerText ?? "",
    termsAndConditions: brandSetting?.termsAndConditions ?? "",
    updatedAt: "",
    userEmail: getCurrentUserEmail(),
  });

  const [error, setError] = useState<BrandSettings>({
    businessName: "",
    businessAddress: "",
    businessWebsite: "",
    logoUrl: "",
    businessPhone: "",
    footerText: "",
    termsAndConditions: "",
    updatedAt: "",
    userEmail: "",
  });

  const { image, pickImage, getImageUri } = useUserImage({
    returnBase64: true,
    maxWidth: 256,
    compress: 0.4,
  });

  const [loading, setLoading] = useState(false);

  const handleDataChange = (
    field: keyof typeof brandSettingData,
    value: string,
  ) => {
    setBrandSettingData({ ...brandSettingData, [field]: value });
    // console.log(`${field}:${value}`);
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    if (image) {
      handleDataChange("logoUrl", image);
      // console.log("image", image);
    }
  }, [image]);

  useEffect(() => {
    fetchBrandSettings();
    console.log("brand settings here ", brandSetting);
  }, []);

  const handlePickImage = async () => {
    try {
      await pickImage();
    } catch (error) {
      console.error("error handling image", error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    if (!brandSetting) return;

    if (brandSettingData.logoUrl) {
      const logo = await uploadImageToCloudinary(brandSettingData.logoUrl);
      console.log("image url", logo);
      if (logo) brandSettingData.logoUrl = logo;
    }
    // setLoading(false);
    // if (!logo) {
    //   setLoading(false);
    //   return;
    // }

    try {
      console.log("brand details", brandSettingData);
      const success = await editBrandSettings({
        ...brandSetting,
        ...brandSettingData,
        logoUrl: brandSettingData.logoUrl ?? "",
        businessName: brandSettingData.businessName,
      });

      if (success) {
        await refreshUser();
        router.replace("/(tabs)/More");
      }
    } catch (error) {
      console.error("error in handleUpdate", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!brandSettingData) return;
    setBrandSettingData(brandSettingData);
    console.log("changed");
  }, [brandSettingData]);

  const imageUrl = image
    ? image
    : brandSettingData?.logoUrl
      ? brandSettingData.logoUrl
      : undefined;

  const handleBack = () => {
    router.replace("/(tabs)/More");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: spacing(20), backgroundColor: "white" }}
    >
      <View style={styles.header}>
        <HapticTab
          style={{
            width: 32,
            aspectRatio: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={handleBack}
        >
          <ChevronLeft
            size={scale(20)}
            color={"rgba(54, 65, 83, 1)"}
            strokeWidth={1.5}
          />
        </HapticTab>

        <View style={styles.col}>
          <Text style={styles.reg24}>Brand</Text>
          <Text style={[Styles.reg14, { color: "rgba(54, 65, 83, 1)" }]}>
            Manage your business details
          </Text>
        </View>
      </View>

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
            paddingVertical: spacing(30),
          }}
          keyboardDismissMode="interactive"
        >
          <View style={styles.content}>
            <View style={styles.imagePic}>
              <Image
                source={{ uri: getImageUri(imageUrl) }}
                style={{
                  width: 80,
                  aspectRatio: 1,
                  alignSelf: "center",
                  borderRadius: 14,
                  borderWidth: 0.2,
                  borderColor: "rgba(0,0,0,0.8)",
                }}
              />

              <HapticTab
                hitSlop={20}
                style={styles.pickIcon}
                onPress={handlePickImage}
              >
                <Pencil size={scale(15)} color={"white"} />
              </HapticTab>
            </View>
            {/* 
              <View style={styles.iconWrapper}>
                <Text style={styles.reg30}>
                  {GetInitials(
                    brandSettingData?.businessName ?? "Fashion Designer",
                  )}
                </Text>
              </View> */}

            <View style={styles.inputs}>
              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Business Name</Text>
                <TextInput
                  value={brandSettingData.businessName}
                  onChangeText={(text) =>
                    handleDataChange("businessName", text)
                  }
                  placeholder="Business Name"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[Styles.input, { paddingVertical: 0 }]}
                />
                {error.businessName ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.businessName}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Business Address</Text>
                <TextInput
                  value={brandSettingData.businessAddress}
                  onChangeText={(text) =>
                    handleDataChange("businessAddress", text)
                  }
                  placeholder="Business Address"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[Styles.input, { paddingVertical: 0 }]}
                />
                {error.businessAddress ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.businessAddress}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Website</Text>
                <TextInput
                  value={brandSettingData.businessWebsite}
                  onChangeText={(text) =>
                    handleDataChange("businessWebsite", text)
                  }
                  placeholder="Website"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  autoCorrect={false}
                  style={[Styles.input, { paddingVertical: 0 }]}
                />
                {error.businessWebsite ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.businessWebsite}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Invoice footer text</Text>
                <TextInput
                  value={brandSettingData.footerText}
                  onChangeText={(text) => handleDataChange("footerText", text)}
                  placeholder="E.g. Account number. Thank your for your patronage"
                  placeholderTextColor={Colors.grayText}
                  textContentType="addressCity"
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  multiline
                  numberOfLines={2}
                  style={[
                    Styles.input,
                    {
                      height: 80,
                      textAlignVertical: "top",
                      paddingTop: spacing(15),
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
                {error.footerText ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.footerText}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Terms & condition</Text>
                <TextInput
                  value={brandSettingData.termsAndConditions}
                  onChangeText={(text) =>
                    handleDataChange("termsAndConditions", text)
                  }
                  placeholder="E.g. A minimum of 60% is required before sewing commences"
                  placeholderTextColor={Colors.grayText}
                  textContentType="addressCity"
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  multiline
                  numberOfLines={2}
                  style={[
                    Styles.input,
                    {
                      height: 80,
                      textAlignVertical: "top",
                      paddingTop: spacing(15),
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
                {error.termsAndConditions ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.termsAndConditions}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.button}>
              <PrimaryButton
                title="Save Changes"
                onPress={handleUpdate}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BrandDetailsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: spacing(8),
  },
  col: {
    gap: spacing(4),
  },
  reg24: {
    fontFamily: "regular",
    fontSize: scaleFontSize(24),
    color: "rgba(54, 65, 83, 1)",
    lineHeight: 32,
  },
  reg30: {
    fontFamily: "regular",
    fontSize: scaleFontSize(30),
    color: "white",
    lineHeight: 36,
  },
  content: {
    flex: 1,
    // paddingVertical: spacing(20),
    paddingHorizontal: 16,
    gap: spacing(26),
  },
  iconWrapper: {
    width: 80,
    aspectRatio: 1,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  inputs: {
    flex: 1,
    gap: spacing(16),
  },
  imagePic: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  pickIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: spacing(8),
    borderRadius: 14,
  },
  button: {},
});
