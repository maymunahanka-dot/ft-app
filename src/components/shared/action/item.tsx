import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { CalculateBoxWidth, scale, spacing } from "@/src/utils/random";
import { LucideIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { HapticTab } from "../../haptic-tab";

type Props = {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
};

const WIDTH = CalculateBoxWidth({ gap: 12, padding: 16, boxCount: 3 });

const ActionItem: React.FC<Props> = ({ label, icon, onPress }) => {
  const Icon = icon;
  return (
    <HapticTab style={[styles.box, { width: WIDTH }]} onPress={onPress}>
      <View style={styles.iconWrapper}>
        <Icon size={scale(15)} color={"rgba(22, 152, 141, 1)"} />
      </View>
      <Text
        style={[Styles.reg12, { color: Colors.text.black, lineHeight: 16 }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </HapticTab>
  );
};

export default ActionItem;

const styles = StyleSheet.create({
  box: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 1)",
    borderRadius: 16,
    padding: spacing(6),
    gap: spacing(8),
  },
  iconWrapper: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(232, 245, 244, 1)",
  },
});
