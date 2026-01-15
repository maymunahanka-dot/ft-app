import PrimaryButton from "@/src/components/button/PrimaryButton";
import { HapticTab } from "@/src/components/haptic-tab";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useAuth } from "@/src/hooks/auth";
import { useUserStore } from "@/src/stores/userSlice";
import { GetInitials, scale, scaleFontSize, spacing } from "@/src/utils/random";
import { LinearGradient } from "expo-linear-gradient";
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

const EditProfileScreen = () => {
  const user = useUserStore((state) => state.user);
  const updateUserDetails = useUserStore((state) => state.updateUserDetails);

  const { refreshUser } = useAuth();

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    lga: "",
    state: "",
    //   address: ""
  });

  const [error, setError] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    lga: "",
    state: "",
    // address: ""
  });

  const [loading, setLoading] = useState(false);

  const handleDataChange = (field: keyof typeof userData, value: string) => {
    setUserData({ ...userData, [field]: value });
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleUserUpdate = async () => {
    setLoading(true);
    if (!user) return;
    try {
      console.log("user details", userData);
      const success = await updateUserDetails({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        lga: userData.lga,
        state: userData.state,
        name: `${userData.firstName} ${userData.lastName}`,
        email: user.email,
        storeName: user.storeName ?? "",
        role: user.role,
        country: user.country,
        createdAt: user.createdAt,
      });

      if (success) {
        await refreshUser();
        router.replace("/(tabs)/More");
      }
    } catch (error) {
      console.error("error in handleUserUpdate", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    setUserData({
      ...user,
      firstName: user.name?.split(" ")[0] ?? "",
      lastName: user.name?.split(" ")[1] ?? "",
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
          <Text style={styles.reg24}>Profile</Text>
          <Text style={[Styles.reg14, { color: "rgba(54, 65, 83, 1)" }]}>
            Update your personal information
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
            <LinearGradient
              colors={["rgba(22, 152, 141, 1)", "rgba(13, 107, 98, 1)"]}
              style={styles.iconWrapper}
            >
              <Text style={styles.reg30}>{GetInitials(user?.name)}</Text>
            </LinearGradient>

            <View style={styles.inputs}>
              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>First Name</Text>
                <TextInput
                  value={userData.firstName}
                  onChangeText={(text) => handleDataChange("firstName", text)}
                  placeholder="First Name"
                  placeholderTextColor={Colors.grayText}
                  textContentType="name"
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[Styles.input, { paddingVertical: 0 }]}
                />
                {error.firstName ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.firstName}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Last Name</Text>
                <TextInput
                  value={userData.lastName}
                  onChangeText={(text) => handleDataChange("lastName", text)}
                  placeholder="Last Name"
                  placeholderTextColor={Colors.grayText}
                  textContentType="name"
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[Styles.input, { paddingVertical: 0 }]}
                />
                {error.lastName ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.lastName}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Email Address</Text>
                <View style={[Styles.input, { opacity: 0.4 }]}>
                  <Text style={[Styles.reg12, { color: Colors.black }]}>
                    {userData.email}
                  </Text>
                </View>
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Phone Number</Text>
                <TextInput
                  value={userData.phone}
                  onChangeText={(text) => handleDataChange("phone", text)}
                  placeholder="Phone Number"
                  placeholderTextColor={Colors.grayText}
                  textContentType="telephoneNumber"
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  maxLength={14}
                  style={[Styles.input, { paddingVertical: 0 }]}
                />
                {error.phone ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.phone}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>LGA/City</Text>
                <TextInput
                  value={userData.lga}
                  onChangeText={(text) => handleDataChange("lga", text)}
                  placeholder="Local Government Area"
                  placeholderTextColor={Colors.grayText}
                  textContentType="addressCity"
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[Styles.input, { paddingVertical: 0 }]}
                />
                {error.lga ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.lga}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>State</Text>
                <TextInput
                  value={userData.state}
                  onChangeText={(text) => handleDataChange("state", text)}
                  placeholder="State"
                  placeholderTextColor={Colors.grayText}
                  textContentType="addressState"
                  returnKeyLabel="done"
                  returnKeyType="done"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[Styles.input, { paddingVertical: 0 }]}
                />
                {error.state ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.state}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.button}>
              <PrimaryButton
                title="Save Changes"
                onPress={handleUserUpdate}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

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
    width: 90,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 100,
  },
  inputs: {
    flex: 1,
    gap: spacing(16),
  },
  button: {},
});
