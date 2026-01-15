import PrimaryButton from "@/src/components/button/PrimaryButton";
import { HapticTab } from "@/src/components/haptic-tab";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useAuth } from "@/src/hooks/auth";
import { useUserStore } from "@/src/stores/userSlice";
import { GetInitials, scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
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
  const user = useUserStore((state) => state.user);
  const updateUserDetails = useUserStore((state) => state.updateUserDetails);

  const { refreshUser } = useAuth();

  const [userData, setUserData] = useState({
    businessName: "",
    businessAddress: "",
    website: "",
    instagram: "",
    //   address: ""
  });

  const [error, setError] = useState({
    businessName: "",
    businessAddress: "",
    website: "",
    instagram: "",
    // address: ""
  });

  const [loading, setLoading] = useState(false);

  const handleDataChange = (field: keyof typeof userData, value: string) => {
    setUserData({ ...userData, [field]: value });
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    if (!user) return;
    try {
      console.log("brand details", userData);
      const success = await updateUserDetails({
        ...user,
        ...userData,
        storeName: userData.businessName,
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
    if (!user) return;
    setUserData({
      businessName: user.storeName ?? "",
      businessAddress: user.businessAddress ?? "",
      website: user.website ?? "",
      instagram: user.instagram ?? "",
    });
    console.log("changed");
  }, [user]);

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
          onPress={() => router.back()}
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
            <View style={styles.iconWrapper}>
              <Text style={styles.reg30}>
                {GetInitials(user?.storeName ?? "Fashion Designer")}
              </Text>
            </View>

            <View style={styles.inputs}>
              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Business Name</Text>
                <TextInput
                  value={userData.businessName}
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
                  value={userData.businessAddress}
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
                  value={userData.website}
                  onChangeText={(text) => handleDataChange("website", text)}
                  placeholder="Website"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  autoCorrect={false}
                  style={[Styles.input, { paddingVertical: 0 }]}
                />
                {error.website ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.website}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Instagram Handle</Text>
                <TextInput
                  value={userData.instagram}
                  onChangeText={(text) => handleDataChange("instagram", text)}
                  placeholder="E.g. @fashionTally"
                  placeholderTextColor={Colors.grayText}
                  textContentType="addressCity"
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[Styles.input, { paddingVertical: 0 }]}
                />
                {error.instagram ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.instagram}
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
    alignSelf: "center",
    borderRadius: 14,
  },
  inputs: {
    flex: 1,
    gap: spacing(16),
  },
  button: {},
});
