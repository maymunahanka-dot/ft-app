import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  props?: TouchableOpacityProps;
};

const PrimaryButton = ({ title, onPress, loading = false, props }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} {...props}>
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.4)",
          "rgba(255, 255, 255, 0)",
          "rgba(255, 255, 255, 0)",
        ]}
        locations={[0, 1, 2]}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator size={"small"} color={"white"} />
        ) : (
          <Text style={[Styles.med14]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 48,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.black50,
  },
});
