import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import MoneyAmount from "@/src/components/shared/MoneyAmount";
import { scaleFontSize } from "@/src/utils/random";
import React from "react";
import { ColorValue, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface StatCircleProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  size?: number;
  colorText?: ColorValue;
  strokeWidth?: number;
}

const StatCircle: React.FC<StatCircleProps> = ({
  title,
  value,
  isCurrency = false,
  size = 160,
  strokeWidth = 16,
  colorText,
}) => {
  const { isDark } = useTheme();

  const textColor = colorText ?? (isDark ? Colors.text.white : "black");
  const trackColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(229, 231, 235, 1)";
  const labelColor = isDark ? "rgba(180,180,180,1)" : "black";

  const radius = (size - strokeWidth) / 2;
  const fullCircumference = 2 * Math.PI * radius;
  const semiCircumference = Math.PI * radius;
  const numericValue = typeof value === "number" ? value : Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const progress = Math.min(Math.max(safeValue, 0) / 100, 1);
  const strokeDashoffset = Number.isFinite(semiCircumference)
    ? semiCircumference * (1 - progress)
    : 0;
  const center = `${size / 2} ${size / 2}`;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size / 2}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="20%" x2="100%" y2="0%">
            <Stop offset="100%" stopColor="rgba(22, 152, 141, 1)" />
            <Stop offset="0%" stopColor={trackColor} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${semiCircumference} ${fullCircumference}`}
          transform={`rotate(-180 ${center})`}
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${semiCircumference} ${fullCircumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-180 ${center})`}
        />
      </Svg>
      <View style={styles.textWrapper}>
        {isCurrency ? (
          <MoneyAmount amount={safeValue} color={String(textColor)} align="center" primarySize={16} />
        ) : (
          <Text style={[styles.value, { color: textColor }]}>
            {`${Math.round(safeValue * 10) / 10}%`}
          </Text>
        )}
        <Text style={[styles.title, { color: labelColor }]}>{title}</Text>
      </View>
    </View>
  );
};

export default StatCircle;

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  textWrapper: { position: "absolute", top: "80%", alignItems: "center" },
  value: { fontFamily: "bold", fontSize: scaleFontSize(16), lineHeight: 20 },
  title: { fontFamily: "medium", fontSize: scaleFontSize(10), textAlign: "center" },
});
