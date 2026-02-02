import { ImageBackground, StyleSheet, Text } from "react-native";

import { memo, type FC } from "react";

import { createAnimatedPressable } from "pressto";
import { interpolate } from "react-native-reanimated";

import { Colors } from "@/src/constants/theme";
import { DrawerItem } from "@/src/stores/navigation/drawerSlice";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { usePathname } from "expo-router";
import type { StyleProp, ViewStyle } from "react-native";

type DrawerListItemProps = {
  item: DrawerItem;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const PressableHighlight = createAnimatedPressable(
  (progress, { isSelected }) => {
    "worklet";
    const opacity = interpolate(progress, [0, 1], [0, 0.1]).toFixed(2);
    const scale = interpolate(progress, [0, 1], [1, 0.95]);

    return {
      backgroundColor: `rgba(255,255,255,${isSelected ? 0.1 : opacity})`,
      transform: [{ scale }],
    };
  },
);

const DrawerListItem: FC<DrawerListItemProps> = memo(
  ({ item, onPress, style }) => {
    const IconComponent = item.icon;
    const pathname = usePathname();
    const currentSegment = pathname.split("/").pop();
    const itemSegment = item.route.toString().split("/").pop();
    const isSelected = currentSegment === itemSegment;

    return (
      <ImageBackground
        source={
          isSelected ? require("@/assets/images/screen_bg.png") : undefined
        }
        style={isSelected && styles.bgContainer}
        imageStyle={styles.bgImage}
      >
        <PressableHighlight style={[styles.container, style]} onPress={onPress}>
          <IconComponent
            size={scale(20)}
            color={isSelected ? "white" : Colors.primaryDark}
          />
          <Text style={[styles.text, isSelected && { color: "white" }]}>
            {item.name}
          </Text>
        </PressableHighlight>
      </ImageBackground>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id;
  },
);

DrawerListItem.displayName = "DrawerListItem";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderCurve: "continuous",
    borderRadius: 12,
    flexDirection: "row",
    flex: 1,
  },
  bgContainer: {
    overflow: "hidden",
  },
  bgImage: {
    borderRadius: 10,
  },
  text: {
    flex: 1,
    fontFamily: "regular",
    fontSize: scaleFontSize(15),
    marginLeft: spacing(12),
    color: Colors.primaryDark,
  },
});

export { DrawerListItem };
