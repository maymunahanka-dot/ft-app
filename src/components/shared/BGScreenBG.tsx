import { Styles } from "@/src/constants/styles";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HapticTab } from "../haptic-tab";

interface Props {
  children: React.ReactNode;
  headerChildren: () => React.JSX.Element;
  title: string;
  subText?: boolean;
  text?: string;
  canGoBack?: boolean;
  // scrollable?: boolean;
  rightIcon: () => React.JSX.Element;
}

const BGScreenBG: React.FC<Props> = ({
  children,
  headerChildren,
  title,
  subText,
  text,
  canGoBack,
  // scrollable = true,
  rightIcon,
}) => {
  const RightComp = rightIcon;
  const HeaderComp = headerChildren;
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/screen_bg.png")}
        // style={styles.bgContainer}
        style={styles.headerView}
      >
        <View style={styles.row}>
          <View style={[styles.startRow, { gap: spacing(8) }]}>
            {canGoBack && (
              <HapticTab onPress={() => router.back()} hitSlop={20}>
                <ChevronLeft size={scale(18)} color={"white"} />
              </HapticTab>
            )}
            <View style={{ gap: spacing(8) }}>
              <Text style={styles.title}>{title}</Text>
              {subText && (
                <Text
                  style={[
                    Styles.reg14,
                    { color: "rgba(255, 255, 255, 0.8)", lineHeight: 18 },
                  ]}
                >
                  {text}
                </Text>
              )}
            </View>
          </View>
          <RightComp />
        </View>
        <HeaderComp />
      </ImageBackground>

      {/* content */}
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
        <View style={styles.content}>{children}</View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerView: {
    paddingVertical: spacing(50),
    paddingHorizontal: 16,
    gap: spacing(33),
    height: 300,
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    paddingHorizontal: spacing(16),
    paddingVertical: spacing(26),
    paddingBottom: spacing(40),
    marginTop: spacing(-40),
    zIndex: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(24),
    lineHeight: 22,
    color: "white",
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(8),
  },
});

export default BGScreenBG;
