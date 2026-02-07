import { HapticTab } from "@/src/components/haptic-tab";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SecurityDetailsScreen = () => {
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
          <Text style={styles.reg24}>Security</Text>
          <Text style={[Styles.reg14, { color: "rgba(54, 65, 83, 1)" }]}>
            Manage password & authentication
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
            <Pressable
              style={styles.row}
              onPress={() => router.push("/(auth)/screen/forget-password")}
            >
              <View style={{ gap: spacing(4) }}>
                <Text style={[Styles.reg16, { color: Colors.text.black }]}>
                  Change Password
                </Text>
                <Text style={[Styles.reg12, { color: Colors.text.gray }]}>
                  Did you forget your password?
                </Text>
              </View>
              <ChevronRight size={scale(18)} color={"rgba(153, 161, 175, 1)"} />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SecurityDetailsScreen;

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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
