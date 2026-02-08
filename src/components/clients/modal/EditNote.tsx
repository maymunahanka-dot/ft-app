import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useClientStore } from "@/src/stores/clientSlice";
import { Client } from "@/src/types/client";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { Save, X } from "lucide-react-native";
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

const EditNote: React.FC<Props> = ({ visible, onClose, client }) => {
  const [notes, setNotes] = useState(client?.notes ? client.notes : "");

  const updateNote = useClientStore((state) => state.editClient);
  const loading = useClientStore((state) => state.loading);

  const handleEditNote = async () => {
    if (!notes?.trim()) return;
    console.log("notes", client.notes, notes);
    try {
      await updateNote({ ...client, notes }, client.phone);
      onClose();
    } catch (error) {
      console.error("error while editng note", error);
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
            <Text style={styles.reg14}>Note</Text>
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
                paddingBottom: spacing(30),
              }}
              keyboardDismissMode="interactive"
            >
              <View style={styles.section}>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g., about client"
                  placeholderTextColor={"grey"}
                  style={[
                    Styles.input,
                    {
                      paddingHorizontal: spacing(16),
                      color: "black",
                      backgroundColor: "white",
                      height: 80,
                      textAlignVertical: "top",
                    },
                  ]}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <HapticTab onPress={handleEditNote} style={styles.rowBtn}>
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

export default EditNote;

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
  section: {
    backgroundColor: "#F9FAFB",
    height: 200,
    padding: spacing(17),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
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
});
