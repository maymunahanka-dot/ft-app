import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { scale, spacing } from "@/src/utils/random";
import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Check, Search } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity } from "react-native";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";

import { tl } from "@/src/i18n";
type OptionType = {
  label: string;
  value: string;
};

type Props = {
  data: OptionType[];
  selected: string;
  visible: boolean;
  onClose: () => void;
  handleOption: (option: string) => void;
  /** Show a search box above the options (for long lists like currencies). */
  searchable?: boolean;
  searchPlaceholder?: string;
};

const SelectFilterModal = ({
  data,
  selected,
  visible,
  onClose,
  handleOption,
  searchable = false,
  searchPlaceholder = "Search",
}: Props) => {
  const { t: tx } = useTranslation();
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? data.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)) : data;
  }, [data, query]);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  useEffect(() => {
    if (visible && bottomSheetRef.current) {
      bottomSheetRef.current.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={true}
      enablePanDownToClose={true}
      onDismiss={handleClosePress}
      backdropComponent={({ style }) => (
        <TouchableOpacity
          onPress={handleClosePress}
          accessible={false}
          focusable={false}
          style={[
            style,
            {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          ]}
        />
      )}
    >
      <BottomSheetScrollView
        style={styles.modalContent}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing(30) }}
        keyboardShouldPersistTaps="handled"
      >
        {searchable && (
          <Pressable style={styles.searchBox}>
            <Search size={scale(16)} color={Colors.text.gray} />
            <BottomSheetTextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor="rgba(106, 114, 130, 0.7)"
              autoCorrect={false}
              autoCapitalize="none"
              style={styles.searchInput}
            />
          </Pressable>
        )}
        {searchable && shown.length === 0 && (
          <Text style={[Styles.reg14, { color: Colors.text.gray, textAlign: "center", paddingVertical: spacing(24) }]}>
            {tx("auto.noMatchesFor_4d14")}{query}"
          </Text>
        )}
        {shown.map((option, index) => {
          const isSelected = selected === option.value;
          return (
            <Pressable
              key={index}
              style={[
                styles.option,
                // isSelected && { backgroundColor: "rgba(106, 114, 130, 0.1)" },
              ]}
              onPress={() => {
                handleOption(option.value);
                handleClosePress();
              }}
              hitSlop={20}
            >
              <Text style={[Styles.reg14, { color: Colors.text.gray }]}>
                {tl(option.label)}
              </Text>
              {isSelected && (
                <Check
                  size={scale(12)}
                  color={Colors.iconGrey}
                  strokeWidth={3}
                />
              )}
            </Pressable>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default SelectFilterModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing(22),
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(8),
    paddingHorizontal: spacing(14),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(106, 114, 130, 0.25)",
    marginBottom: spacing(6),
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing(12),
    fontSize: 15,
    color: "#1f2937",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing(24),
    borderBottomWidth: 0.3,
    borderColor: "rgba(106, 114, 130, 0.2)",
  },
});
