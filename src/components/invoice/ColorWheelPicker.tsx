import { Colors } from "@/src/constants/theme";
import { scale, spacing } from "@/src/utils/random";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { runOnJS } from "react-native-reanimated";
import ColorPicker, {
  HueSlider,
  Panel1,
  Preview,
  SaturationSlider,
} from "reanimated-color-picker";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";

interface Props {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}

export const ColorWheelPicker: React.FC<Props> = ({
  value,
  onChange,
}) => {
  const { t: tx } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempColor, setTempColor] = useState(value);

  const setColor = (hex: string) => {
    setTempColor(hex);
  };

  const onColorChange = ({ hex }: { hex: string }) => {
    "worklet";
    runOnJS(setColor)(hex);
  };

  const handleConfirm = () => {
    onChange(tempColor);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>

        <Pressable
          onPress={() => {
            setTempColor(value);
            setModalVisible(true);
          }}
          style={styles.triggerRow}
        >
          {/* Color swatch preview */}
          <View style={[styles.swatch, { backgroundColor: value }]} />
          <Text style={styles.hexText}>{value.toUpperCase()}</Text>
          <Text style={styles.changeText}>{tx("auto.change_0b5f")}</Text>
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setModalVisible(false)}
        />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{tx("auto.chooseInvoiceColor_9d89")}</Text>

          <ColorPicker
            value={value}
            onChange={onColorChange}
            style={{ gap: spacing(16) }}
          >
            {/* Main color square */}
            <Panel1 style={{ borderRadius: 12 }} />

            {/* Hue rainbow slider */}
            <HueSlider style={{ borderRadius: 8, height: 28 }} />

            {/* Saturation slider */}
            <SaturationSlider style={{ borderRadius: 8, height: 28 }} />

            {/* Live preview */}
            <Preview
              style={{ borderRadius: 10, height: 48 }}
              hideInitialColor
            />
          </ColorPicker>

          <View style={styles.btnRow}>
            <Pressable
              style={[styles.btn, styles.cancelBtn]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>{tx("auto.cancel_77df")}</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.confirmBtn]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>{tx("auto.apply_cfea")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing(8),
  },
  label: {
    fontSize: scale(13),
    color: "rgba(54, 65, 83, 1)",
    fontWeight: "500",
  },
  triggerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(12),
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 10,
    paddingHorizontal: spacing(14),
    paddingVertical: spacing(12),
    backgroundColor: "#fafafa",
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  hexText: {
    flex: 1,
    fontSize: scale(14),
    color: "rgba(10,10,10,0.85)",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  changeText: {
    fontSize: scale(12),
    color: Colors.primary,
    fontWeight: "500",
  },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing(24),
    gap: spacing(20),
  },
  sheetTitle: {
    fontSize: scale(16),
    fontWeight: "700",
    color: "rgba(10,10,10,0.9)",
    textAlign: "center",
  },
  btnRow: {
    flexDirection: "row",
    gap: spacing(12),
    marginTop: spacing(4),
  },
  btn: {
    flex: 1,
    paddingVertical: spacing(14),
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
  },
  cancelText: {
    fontSize: scale(14),
    color: "rgba(10,10,10,0.7)",
    fontWeight: "600",
  },
  confirmText: {
    fontSize: scale(14),
    color: "white",
    fontWeight: "700",
  },
});
