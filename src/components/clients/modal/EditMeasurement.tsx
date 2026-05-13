import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useClientStore } from "@/src/stores/clientSlice";
import { Client } from "@/src/types/client";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { Lightbulb, Save, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { HapticTab } from "../../haptic-tab";

type Props = {
  client: Client;
  visible: boolean;
  onClose: () => void;
};

const AddMeasurements: React.FC<Props> = ({ visible, onClose, client }) => {
  const editMeasurements = useClientStore((state) => state.editMeasurements);
  const loading = useClientStore((state) => state.loading);

  const [newMeasurement, setNewMeasurement] = useState({
    field: "",
    value: "",
  });

  const handleAddMeasurement = async () => {
    const key = newMeasurement.field.trim().toLowerCase();
    const value = newMeasurement.value.trim();

    if (!key || !value) return;

    const updates = {
      [key]: value,
    };

    console.log("details", JSON.stringify(updates, null, 2));

    try {
      await editMeasurements(client, updates);
      onClose();
    } catch (error) {
      console.error("error adding measurements", error);
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.row}>
            <Text style={styles.reg14}>Measurements</Text>
            <HapticTab hitSlop={20} onPress={onClose}>
              <X size={scale(18)} color="black" />
            </HapticTab>
          </View>
          <KeyboardAvoidingView
            style={{
              //   flex: 1,
              backgroundColor: "white",
            }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={
              Platform.OS === "ios" ? spacing(50) : spacing(0)
            }
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{
                flexGrow: 1,
              }}
              keyboardDismissMode="interactive"
            >
              <View style={styles.section}>
                <View style={[Styles.inputContainer, { gap: spacing(8) }]}>
                  <Text style={styles.reg12}>Measurement Name</Text>
                  <TextInput
                    value={newMeasurement.field}
                    onChangeText={(text) =>
                      setNewMeasurement({
                        ...newMeasurement,
                        field: text,
                      })
                    }
                    placeholder="e.g., about client"
                    placeholderTextColor={"grey"}
                    style={[
                      Styles.input,
                      {
                        fontFamily: "regular",
                        paddingVertical: 0,
                        backgroundColor: "white",
                      },
                    ]}
                  />
                </View>

                <View style={[Styles.inputContainer, { gap: spacing(8) }]}>
                  <Text style={styles.reg12}>Value (inches)</Text>
                  <View style={[Styles.input2, { backgroundColor: "white" }]}>
                    <TextInput
                      value={newMeasurement.value}
                      onChangeText={(text) =>
                        setNewMeasurement({
                          ...newMeasurement,
                          value: text,
                        })
                      }
                      placeholder="e.g., 36"
                      placeholderTextColor={"grey"}
                      style={styles.input}
                      keyboardType="numeric"
                    />
                    <Text style={[styles.reg12, { color: Colors.grey }]}>
                      inches
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={styles.infoBox}>
            <Lightbulb size={scale(15)} color={"#2B7FFF"} />
            <View style={{ gap: spacing(5), flexShrink: 1 }}>
              <Text
                style={[styles.reg12, { color: "#1C398E", lineHeight: 16 }]}
              >
                Tip
              </Text>
              <Text style={[styles.reg10, { color: "#1447E6" }]}>
                Common measurements: Chest, Waist, Hips, Shoulder Width, Sleeve
                Length, Inseam, Neck, Bust, Dress Length
              </Text>
            </View>
          </View>

          <HapticTab onPress={handleAddMeasurement} style={styles.rowBtn}>
            {loading ? (
              <ActivityIndicator size={scale(18)} color={"white"} />
            ) : (
              <>
                <Save size={scale(18)} color={"white"} />
                <Text style={styles.reg16}>Save</Text>
              </>
            )}
          </HapticTab>
        </View>
      </View>
    </Modal>
  );
};

export default AddMeasurements;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.black80,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: spacing(20),
    paddingVertical: spacing(16),
    gap: spacing(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reg14: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
  },
  reg16: {
    fontFamily: "regular",
    fontSize: scaleFontSize(16),
    color: "white",
  },
  reg12: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
    color: Colors.text.gray,
  },
  reg10: {
    fontFamily: "regular",
    fontSize: scaleFontSize(10),
    color: Colors.text.gray,
  },
  section: {
    backgroundColor: "#F9FAFB",
    height: 250,
    padding: spacing(17),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    gap: spacing(12),
  },
  rowBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing(10),
    height: 45,
    borderRadius: 16,
  },
  input: {
    height: 48,
    flex: 1,
    color: Colors.black,
    fontFamily: "regular",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  infoBox: {
    marginVertical: spacing(10),
    backgroundColor: "#EFF6FF",
    padding: spacing(18),
    flexDirection: "row",
    gap: spacing(8),
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 16,
  },
});
