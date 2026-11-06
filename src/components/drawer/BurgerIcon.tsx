import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { useNavigation } from "expo-router";
import { Menu } from "lucide-react-native";
import { ReactNode } from "react";
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
  right?: ReactNode;
};

const BurgerIcon = ({ title, textStyle, iconColor, viewStyle, right }: Props) => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const color = iconColor ?? (isDark ? "white" : Colors.text.black);

  return (
    <View style={[styles.row, viewStyle]}>
      <HapticTab hitSlop={20} onPress={() => (navigation as any).toggleDrawer()}>
        <Menu size={scale(24)} color={color} />
      </HapticTab>
      <View style={styles.titleRow}>
        <Text style={[styles.title, textStyle]}>{title}</Text>
        {right}
      </View>
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
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(8),
  },
  title: {
    fontFamily: "regular",
    fontSize: scaleFontSize(16),
    color: "black",
    lineHeight: 20,
  },
});
