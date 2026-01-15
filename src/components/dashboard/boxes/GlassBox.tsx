import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface GlassCardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Blur layer */}
      <BlurView intensity={15} tint="light" style={styles.blur} />

      {/* Glass overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      {/* <View style={styles.content}>{children}</View> */}
      {children}
    </View>
  );
};

export default GlassCard;
const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.01)",
  },

  blur: {
    ...StyleSheet.absoluteFillObject,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  content: {
    flex: 1,
    padding: 16,
  },
});
