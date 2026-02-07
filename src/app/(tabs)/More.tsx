import GlassCard from "@/src/components/dashboard/boxes/GlassBox";
import BGScreenBG from "@/src/components/shared/BGScreenBG";
import { MoreSection } from "@/src/constants/config";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useUserStore } from "@/src/stores/userSlice";
import {
  CapitalizeFirstName,
  GetInitials,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Mail, MapPin, Smartphone } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RowBoxes = () => {
  const user = useUserStore((state) => state.user);

  return (
    <View style={{}}>
      <GlassCard style={styles.box}>
        <View style={styles.startRow}>
          <View style={styles.placeHolder}>
            <Text style={styles.med24}>
              {GetInitials(
                user?.storeName
                  ? user?.storeName
                  : (user?.name ?? "Fashion House"),
              )}
            </Text>
          </View>

          <View style={styles.col}>
            <Text style={[styles.med24, { color: "white", lineHeight: 28 }]}>
              {CapitalizeFirstName(
                user?.storeName
                  ? user?.storeName
                  : (user?.name ?? "Fashion House"),
              )}
            </Text>
            <Text style={[Styles.reg14, { color: "white" }]}>
              {CapitalizeFirstName(user?.name ?? "Fashion Tally")}
            </Text>
          </View>
        </View>

        <View style={[styles.col, { gap: spacing(8) }]}>
          <View style={styles.startRow}>
            <MapPin size={scale(14)} color={"white"} />
            <Text style={[Styles.reg14, { color: "white" }]}>
              {user?.lga}, {user?.state}
            </Text>
          </View>

          <View style={styles.startRow}>
            <Mail size={scale(14)} color={"white"} />
            <Text style={[Styles.reg14, { color: "white" }]}>
              {user?.email}
            </Text>
          </View>

          <View style={styles.startRow}>
            <Smartphone size={scale(14)} color={"white"} />
            <Text style={[Styles.reg14, { color: "white" }]}>
              {user?.phone}
            </Text>
          </View>
        </View>
      </GlassCard>
    </View>
  );
};

const MoreScreen = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["bottom"]}
    >
      <BGScreenBG
        title="More"
        rightIcon={() => <View style={{}}></View>}
        headerChildren={RowBoxes}
        paddingVertical={50}
        height={400}
        drawer
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
          <View style={styles.content}>
            {MoreSection.map((section, index) => {
              const Icon = section.icon;
              return (
                <Pressable
                  style={styles.section}
                  key={index}
                  onPress={section.onPress}
                >
                  <View style={styles.startRow}>
                    <LinearGradient
                      colors={["rgba(13, 107, 98, 1)", "rgba(22, 152, 141, 1)"]}
                      style={styles.iconWrapper}
                    >
                      <Icon size={scale(20)} color={"white"} />
                    </LinearGradient>

                    <View style={styles.col}>
                      <Text
                        style={[Styles.reg14, { color: Colors.text.black }]}
                      >
                        {section.title}
                      </Text>
                      <Text style={[Styles.reg12, { color: Colors.text.gray }]}>
                        {section.details}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight
                    size={scale(16)}
                    color={"rgba(153, 161, 175, 1)"}
                  />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </BGScreenBG>
    </SafeAreaView>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing(12),
    paddingTop: spacing(26),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(16),
  },
  box: {
    padding: spacing(24),
    gap: spacing(16),
  },
  placeHolder: {
    backgroundColor: "white",
    width: 60,
    aspectRatio: 1,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  med24: {
    fontFamily: "medium",
    fontSize: scaleFontSize(24),
    color: Colors.primary,
    flexShrink: 1,
  },
  col: {
    gap: spacing(4),
  },
  reg18: {
    fontFamily: "regular",
    fontSize: scaleFontSize(18),
    color: "white",
  },
  section: {
    backgroundColor: "rgba(249, 250, 251, 1)",
    gap: spacing(16),
    padding: spacing(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
  },
  iconWrapper: {
    width: 48,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
});
