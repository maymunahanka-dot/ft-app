import { useUserImage } from "@/src/hooks/useUserImage";
import { useUserStore } from "@/src/stores/userSlice";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router, useNavigation } from "expo-router";
import { ChevronLeft, Menu } from "lucide-react-native";
import React from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HapticTab } from "../haptic-tab";
import ImagePlaceholder from "./ImagePlaceholder";

type Props = {
  children: React.ReactNode;
  title: string;
  canGoBack?: boolean;
  rightIcon: () => React.JSX.Element;
  drawer?: boolean;
};

const TabImageBackground: React.FC<Props> = ({
  children,
  title,
  canGoBack = false,
  rightIcon,
  drawer = false,
}) => {
  const RightComp = rightIcon;

  const navigation = useNavigation();

  const user = useUserStore((state) => state.user);
  const fullName =
    (user?.firstName ?? user?.name?.split(" ")[0] ?? "") +
    " " +
    (user?.lastName ?? user?.name?.split(" ")[1] ?? "");
  const isBusiness = user?.role === "Business";
  const name = isBusiness ? (user?.storeName ?? "") : fullName;

  const { getImageUri } = useUserImage();

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("@/assets/images/screen_bg.png")}
        style={styles.bgContainer}
      >
        <View style={styles.headerView}>
          <View style={styles.row}>
            <View style={[styles.startRow, { gap: spacing(8) }]}>
              {drawer && (
                <HapticTab
                  hitSlop={20}
                  onPress={() => (navigation as any).toggleDrawer()}
                  style={{ marginRight: spacing(20) }}
                >
                  <Menu size={scale(24)} color={"white"} />
                </HapticTab>
              )}
              {canGoBack && (
                <HapticTab onPress={() => router.back()} hitSlop={20}>
                  <ChevronLeft size={scale(18)} color={"white"} />
                </HapticTab>
              )}
              <Text style={styles.title}>{title}</Text>
            </View>
            <RightComp />
          </View>
          <View style={styles.startRow}>
            {user?.logo ? (
              <Image
                source={{ uri: getImageUri(user.logo) }}
                style={{ width: 50, aspectRatio: 1, borderRadius: 100 }}
              />
            ) : (
              <ImagePlaceholder name={name} size={40} fontSize={15} />
            )}
            <View style={styles.col}>
              <Text style={styles.reg16}>Welcome back,</Text>
              <Text style={styles.bold16} numberOfLines={1}>
                {fullName}
              </Text>
            </View>
          </View>
        </View>
        {/* <View style={styles.content}>{children}</View> */}
      </ImageBackground>
      <View style={styles.content}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardDismissMode="interactive"
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

export default TabImageBackground;

const styles = StyleSheet.create({
  bgContainer: {
    paddingTop: spacing(50),
  },
  headerView: {
    gap: spacing(15),
    paddingHorizontal: 16,
    paddingBottom: spacing(60),
  },
  col: {
    gap: spacing(2),
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
  reg16: {
    fontFamily: "regular",
    fontSize: scaleFontSize(16),
    color: "white",
    lineHeight: 16,
  },
  bold16: {
    fontFamily: "bold",
    fontSize: scaleFontSize(16),
    color: "white",
  },
  content: {
    flex: 1,
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    backgroundColor: "white",
    paddingHorizontal: spacing(16),
    marginTop: spacing(-30),
    zIndex: 10,
  },
});
