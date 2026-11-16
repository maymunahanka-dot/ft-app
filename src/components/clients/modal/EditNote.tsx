import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { useClientStore } from "@/src/stores/clientSlice";
import { Client } from "@/src/types/client";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { Save, X } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { HapticTab } from "../../haptic-tab";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";

type Props = { client: Client; visible: boolean; onClose: () => void };

const EditNote: React.FC<Props> = ({ visible, onClose, client }) => {
  const { t: tx } = useTranslation();
  const [notes, setNotes] = useState(client?.notes ?? "");
  const updateNote = useClientStore((state) => state.editClient);
  const loading = useClientStore((state) => state.loading);
  const { isDark } = useTheme();

  const modalBg = isDark ? "#1c1c1e" : "white";
  const sectionBg = isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB";
  const sectionBorder = isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB";
  const textColor = isDark ? Colors.text.white : Colors.text.black;
  const inputColor = isDark ? Colors.text.white : "black";
  const placeholderColor = isDark ? "rgba(120,120,120,1)" : "grey";

  const handleEditNote = async () => {
    if (!notes?.trim()) return;
    try { await updateNote({ ...client, notes }, client.phone); onClose(); }
    catch (e) { console.error(e); }
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalContainer, { backgroundColor: modalBg }]}>
          <View style={styles.row}>
            <Text style={[styles.reg14, { color: textColor }]}>{tx("auto.note_2c92")}</Text>
            <HapticTab hitSlop={20} onPress={onClose}>
              <X size={scale(18)} color={isDark ? "rgba(160,160,160,1)" : "black"} />
            </HapticTab>
          </View>

          <KeyboardAvoidingView style={{ backgroundColor: modalBg }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? spacing(50) : 0}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing(30) }} keyboardDismissMode="interactive">
              <View style={[styles.section, { backgroundColor: sectionBg, borderColor: sectionBorder }]}>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={tx("auto.eGAboutClient_7e4d")}
                  placeholderTextColor={placeholderColor}
                  style={[Styles.input, { paddingHorizontal: spacing(16), color: inputColor, backgroundColor: "transparent", height: 80, textAlignVertical: "top" }]}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <HapticTab onPress={handleEditNote} style={styles.rowBtn}>
            {loading ? <ActivityIndicator size={scale(18)} color="white" /> : <><Save size={scale(18)} color="white" /><Text style={styles.reg16}>{tx("auto.save_efc0")}</Text></>}
          </HapticTab>
        </View>
      </View>
    </Modal>
  );
};

export default EditNote;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.black80, justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", borderRadius: 16, paddingHorizontal: spacing(20), paddingVertical: spacing(16), gap: spacing(12), elevation: 5 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reg14: { fontFamily: "regular", fontSize: scaleFontSize(14) },
  reg16: { fontFamily: "regular", fontSize: scaleFontSize(16), color: "white" },
  section: { height: 160, padding: spacing(12), borderWidth: 1, borderRadius: 16 },
  rowBtn: { backgroundColor: Colors.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: spacing(10), height: 45, borderRadius: 16 },
});
