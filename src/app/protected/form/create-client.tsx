import PrimaryButton from "@/src/components/button/PrimaryButton";
import { HapticTab } from "@/src/components/haptic-tab";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { getCurrentUserEmail } from "@/src/lib/auth-utils";
import { useClientStore } from "@/src/stores/clientSlice";
import { Client } from "@/src/types/client";
import {
  FormatDateToYYYYMMDD,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
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

const CreateClientScreen = () => {
  const saveClient = useClientStore((state) => state.saveClient);
  const loading = useClientStore((state) => state.loading);

  const [clientData, setClientData] = useState<Client>({
    id: "",
    name: "",
    phone: "",
    email: "",
    lastVisit: "",
    tailorId: getCurrentUserEmail(),
    createdAt: "",
    notes: "",
  });

  const [error, setError] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const handleDataChange = (
    field: keyof typeof clientData,
    value: string | number
  ) => {
    setClientData({ ...clientData, [field]: value });
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
    };

    let isValid = true;

    // Name
    if (!clientData.name.trim()) {
      newErrors.name = "Client name is required";
      isValid = false;
    }

    // Email
    if (!clientData.email.trim()) {
      newErrors.email = "Email address is required";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientData.email)) {
        newErrors.email = "Enter a valid email address";
        isValid = false;
      }
    }

    // Phone
    if (!clientData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else {
      // Basic Nigerian phone validation
      const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
      if (!phoneRegex.test(clientData.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Enter a valid Nigerian phone number";
        isValid = false;
      }
    }

    setError(newErrors);
    return isValid;
  };

  const handleSaveClient = async () => {
    if (!validateForm()) return;

    try {
      const payload: Client = {
        ...clientData,
        id: clientData.phone,
        createdAt: new Date().toISOString(),
        lastVisit: FormatDateToYYYYMMDD(new Date().toISOString()),
      };

      await saveClient(payload);
      router.back();
    } catch (error) {
      console.error("Error saving client", error);
    }
  };

  return (
    <>
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

          <Text style={styles.reg24}>Add New Client</Text>
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
              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Name<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={clientData.name}
                  onChangeText={(text) => handleDataChange("name", text)}
                  placeholder="Enter client's full name"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[
                    Styles.input,
                    {
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
                {error.name ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.name}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Email Address<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={clientData.email}
                  onChangeText={(text) => handleDataChange("email", text)}
                  placeholder="client@email.com"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="email-address"
                  autoCorrect={false}
                  style={[
                    Styles.input,
                    {
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
                {error.email ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.email}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Phone Number<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={clientData.phone}
                  onChangeText={(text) => handleDataChange("phone", text)}
                  placeholder="+234 803 456 7890"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="number-pad"
                  maxLength={14}
                  style={[
                    Styles.input,
                    {
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
                {error.phone ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.phone}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Notes</Text>
                <TextInput
                  value={clientData.notes}
                  onChangeText={(text) => handleDataChange("notes", text)}
                  placeholder="Add notes about this client (preferences, special requirements, etc.)"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  style={[
                    Styles.input,
                    {
                      height: 100,
                      textAlignVertical: "top",
                      paddingTop: spacing(15),
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
              </View>

              <View style={styles.button}>
                <PrimaryButton
                  title="Save Client"
                  onPress={handleSaveClient}
                  loading={loading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default CreateClientScreen;

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
    gap: spacing(14),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  red: {
    color: "rgba(251, 44, 54, 1)",
  },
  button: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
