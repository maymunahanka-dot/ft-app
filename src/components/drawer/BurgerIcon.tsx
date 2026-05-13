import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { useNavigation } from "expo-router";
import { Menu } from "lucide-react-native";
import React from "react";
import {
  ColorValue,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { HapticTab } from "../haptic-tab";

type Props = {
  title?: string;
  iconColor?: ColorValue;
  textStyle: StyleProp<TextStyle>;
  viewStyle: StyleProp<ViewStyle>;
};

const BurgerIcon = ({ title, textStyle, iconColor, viewStyle }: Props) => {
  const navigation = useNavigation();
  return (
    <View style={[styles.row, viewStyle]}>
      <HapticTab
        hitSlop={20}
        onPress={() => (navigation as any).toggleDrawer()}
      >
        <Menu size={scale(24)} color={iconColor} />
      </HapticTab>
      <Text style={[styles.title, textStyle]}>{title}</Text>
    </View>
  );
};

export default BurgerIcon;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(20),
  },
  title: {
    fontFamily: "regular",
    fontSize: scaleFontSize(16),
    color: "black",
    lineHeight: 20,
  },
});
