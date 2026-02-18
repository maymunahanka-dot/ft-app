import { HapticTab } from "@/src/components/haptic-tab";
import { useDesignStore } from "@/src/stores/designSlice";
import {
  FormatCurrency,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const ViewDesignItemScreen = () => {
  const { id } = useLocalSearchParams();

  const loading = useDesignStore((state) => state.loading);
  const designs = useDesignStore((state) => state.designs);

  const deleteDesign = useDesignStore((state) => state.deleteDesign);
  const foundDesign = designs.find((prev) => prev.id === id.toString());

  // console.log("design found", JSON.stringify(foundDesign, null, 2));

  const handleDeleteDesign = async () => {
    if (!foundDesign) return;
    try {
      await deleteDesign(foundDesign?.id);
      router.back();
    } catch (err) {
      console.error("Error deleting design", err);
    }
  };

  const handleBack = () => {
    router.replace("/(tabs)/Designs");
  };

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, paddingTop: spacing(20), backgroundColor: "white" }}
      >
        <View style={styles.header}>
          <HapticTab
            style={{
              position: "absolute",
              left: 16,
              width: 32,
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 100,
            }}
            hitSlop={20}
            onPress={handleBack}
          >
            <ChevronLeft
              size={scale(20)}
              color={"rgba(54, 65, 83, 1)"}
              strokeWidth={1.5}
            />
          </HapticTab>

          <Text
            style={[
              styles.reg16,
              {
                width: "100%",
                alignSelf: "center",
                textAlign: "center",
              },
            ]}
          >
            Design Details
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: spacing(30),
            paddingBottom: spacing(50),
          }}
          keyboardDismissMode="interactive"
        >
          <View style={styles.content}>
            {foundDesign?.imageUrl?.trim() ? (
              <View style={{ gap: spacing(12) }}>
                <Image
                  source={{ uri: foundDesign?.imageUrl }}
                  style={styles.designImg}
                />
                <Image
                  source={{ uri: foundDesign?.imageUrl }}
                  style={styles.recImg}
                />
              </View>
            ) : (
              <View style={{ paddingVertical: spacing(30) }}>
                <Text style={[styles.reg24, { textAlign: "center" }]}>
                  No Image
                </Text>
              </View>
            )}

            <View style={[styles.col, { gap: spacing(8) }]}>
              <Text style={[styles.reg24, { color: "rgba(10, 10, 10, 1)" }]}>
                {foundDesign?.name}
              </Text>
              <View style={styles.badge}>
                <Text style={[styles.reg12, { color: "rgba(202, 53, 0, 1)" }]}>
                  Available
                </Text>
              </View>
            </View>

            <View style={styles.col}>
              <Text style={[styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
                Starting Price
              </Text>
              <Text style={[styles.reg14, { color: "rgba(10, 10, 10, 1)" }]}>
                {FormatCurrency(foundDesign?.price ?? 0)}
              </Text>
            </View>

            <View style={[styles.col, { gap: spacing(12) }]}>
              <Text style={[styles.reg14, { color: "rgba(10, 10, 10, 1)" }]}>
                Notes
              </Text>
              <View style={styles.notebox}>
                <Text style={[styles.reg14, { color: "rgba(74, 85, 101, 1)" }]}>
                  {foundDesign?.notes?.trim() ? foundDesign.notes : "No notes"}
                </Text>
              </View>
            </View>

            {/* buttons */}
            <View
              style={[
                styles.row,
                {
                  flex: 1,
                  gap: spacing(80),
                  alignItems: "flex-end",
                },
              ]}
            >
              <HapticTab
                style={styles.primaryBtn}
                onPress={() => {
                  router.push({
                    pathname: "/protected/design/[id]",
                    params: {
                      id: foundDesign?.id ?? "",
                    },
                  });
                }}
              >
                <Pencil size={scale(18)} color={"white"} />
                <Text style={styles.btnText}>Edit Design</Text>
              </HapticTab>

              <Pressable
                style={styles.deleteBtn}
                onPress={handleDeleteDesign}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator
                    size={"small"}
                    color={"rgba(231, 0, 11, 1)"}
                  />
                ) : (
                  <Trash2 size={scale(15)} color={"rgba(231, 0, 11, 1)"} />
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default ViewDesignItemScreen;

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
  reg16: {
    fontFamily: "regular",
    fontSize: scaleFontSize(16),
    color: "rgba(54, 65, 83, 1)",
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
    paddingHorizontal: 16,
    gap: spacing(20),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  designImg: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.4,
    borderRadius: 16,
  },
  recImg: {
    width: 80,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(22, 152, 141, 1)",
  },
  badge: {
    backgroundColor: "rgba(255, 237, 212, 1)",
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(6),
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  notebox: {
    backgroundColor: "rgba(254, 252, 232, 1)",
    padding: spacing(12),
    borderRadius: 14,
  },

  primaryBtn: {
    flex: 1,
    height: 56,
    backgroundColor: "rgba(22, 152, 141, 1)",
    gap: spacing(8),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  deleteBtn: {
    backgroundColor: "rgba(254, 242, 242, 1)",
    width: 66,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  btnText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(16),
    color: "white",
    lineHeight: 24,
  },
});
