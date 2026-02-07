import { Colors } from "@/src/constants/theme";
import { Design } from "@/src/types/designs";
import {
  CapitalizeFirstName,
  FormatCurrency,
  FormatDateToYYYYMMDD,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { HapticTab } from "../haptic-tab";

const HEIGHT = 270;

type Props = {
  item: Design;
  style?: StyleProp<ViewStyle>;
};

const DesignItem: React.FC<Props> = ({ item, style }) => {
  return (
    <HapticTab
      style={[styles.container, style]}
      onPress={() =>
        router.replace({
          pathname: "/protected/design/[id]",
          params: {
            id: item.id,
          },
        })
      }
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.colText}>
        <Text style={styles.reg14}>{CapitalizeFirstName(item.name)}</Text>
        <Text style={[styles.reg14, { color: Colors.text.gray }]}>
          {FormatDateToYYYYMMDD(item.createdAt?.toString())}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.reg14, { color: Colors.primary }]}>
            {FormatCurrency(item.price)}
          </Text>
          <ChevronRight size={scale(10)} color={"#99A1AF"} height={16} />
        </View>
      </View>
    </HapticTab>
  );
};

export default DesignItem;

const styles = StyleSheet.create({
  container: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
  },
  image: {
    width: "100%",
    height: HEIGHT * 0.6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  colText: {
    padding: spacing(12),
    gap: spacing(4),
  },
  reg14: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: Colors.text.black,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
