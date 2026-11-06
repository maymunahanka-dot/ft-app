import { Colors } from "@/src/constants/theme";
import { DrawerItem } from "@/src/stores/navigation/drawerSlice";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { usePathname } from "expo-router";
import { memo, type FC } from "react";
import { ImageBackground, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { createAnimatedPressable } from "pressto";
import { interpolate } from "react-native-reanimated";

type DrawerListItemProps = {
  item: DrawerItem;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  isDark?: boolean;
};

const PressableScaleItem = createAnimatedPressable((progress) => {
  "worklet";
  return {
    opacity: interpolate(progress, [0, 1], [1, 0.75]),
    transform: [{ scale: interpolate(progress, [0, 1], [1, 0.97]) }],
  };
});

const DrawerListItem: FC<DrawerListItemProps> = memo(
  ({ item, onPress, style, isDark = false }) => {
    const IconComponent = item.icon;
    const pathname = usePathname();
    const currentSegment = pathname.split("/").pop();
    const itemSegment = item.route.toString().split("/").pop();
    const isSelected = currentSegment === itemSegment;

    const textColor = isDark ? "rgba(225,225,225,1)" : Colors.primaryDark;
    const iconColor = isDark ? "rgba(170,170,170,1)" : "rgba(90,105,105,1)";
    const iconBoxBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(22,152,141,0.07)";
    return (
      <ImageBackground
        source={isSelected ? require("@/assets/images/screen_bg.png") : undefined}
        style={isSelected ? styles.selectedBg : undefined}
        imageStyle={styles.selectedBgImage}
      >
        <PressableScaleItem style={[styles.container, style]} onPress={onPress}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : iconBoxBg },
            ]}
          >
            <IconComponent size={scale(16)} color={isSelected ? "white" : iconColor} />
          </View>
          <Text
            numberOfLines={1}
            style={[
              styles.text,
              isSelected ? { color: "white", fontFamily: "semibold" } : { color: textColor },
            ]}
          >
            {item.name}
          </Text>
        </PressableScaleItem>
      </ImageBackground>
    );
  },
  (prev, next) => prev.item.id === next.item.id && prev.isDark === next.isDark,
);

DrawerListItem.displayName = "DrawerListItem";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 12,
    flexDirection: "row",
  },
  selectedBg: {
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  selectedBgImage: {
    borderRadius: 12,
  },
  iconBox: {
    width: scale(30),
    height: scale(30),
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    lineHeight: Math.ceil(scaleFontSize(14) * 1.45),
    marginLeft: spacing(12),
  },
});

export { DrawerListItem };
