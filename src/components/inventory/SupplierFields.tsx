import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { InventorySupplier } from "@/src/types/inventory";
import { scale, spacing } from "@/src/utils/random";
import { Plus, X } from "lucide-react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type SupplierFieldsProps = {
  suppliers: InventorySupplier[];
  onChange: (suppliers: InventorySupplier[]) => void;
  error?: string;
};

const SupplierFields = ({ suppliers, onChange, error }: SupplierFieldsProps) => {
  const { isDark } = useTheme();
  const labelColor = isDark ? "rgba(160,160,160,1)" : Colors.label;
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "white";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : Colors.inputBorder;
  const inputTextColor = isDark ? Colors.text.white : Colors.black;
  const placeholderColor = isDark ? "rgba(100,100,100,1)" : Colors.grayText;
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(248, 250, 252, 1)";
  const titleColor = isDark ? Colors.text.white : "rgba(54, 65, 83, 1)";

  const update = (index: number, field: keyof InventorySupplier, value: string) => {
    const next = suppliers.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry));
    onChange(next);
  };

  return (
    <View style={{ gap: spacing(8) }}>
      <Text style={[Styles.label, { color: labelColor }]}>Suppliers</Text>
      {suppliers.map((entry, index) => (
        <View key={index} style={[styles.card, { backgroundColor: cardBg, borderColor: inputBorder }]}>
          <View style={styles.head}>
            <Text style={[styles.title, { color: titleColor }]}>
              {suppliers.length > 1 ? `Supplier ${index + 1}` : "Supplier"}
            </Text>
            {suppliers.length > 1 && (
              <Pressable
                onPress={() => onChange(suppliers.filter((_, i) => i !== index))}
                hitSlop={8}
                accessibilityLabel="Remove supplier"
              >
                <X size={scale(16)} color="rgba(220, 38, 38, 1)" />
              </Pressable>
            )}
          </View>
          <View style={Styles.inputContainer}>
            <Text style={[Styles.label, { color: labelColor }]}>
              Name{index === 0 ? <Text style={styles.red}> *</Text> : null}
            </Text>
            <TextInput
              value={entry.name}
              onChangeText={(text) => update(index, "name", text)}
              placeholder="Lagos Textiles Ltd"
              placeholderTextColor={placeholderColor}
              autoCorrect={false}
              style={[Styles.input, styles.field, { backgroundColor: inputBg, borderColor: inputBorder, color: inputTextColor }]}
            />
            {index === 0 && error ? (
              <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>{error}</Text>
            ) : null}
          </View>
          <View style={Styles.inputContainer}>
            <Text style={[Styles.label, { color: labelColor }]}>Contact</Text>
            <TextInput
              value={entry.contact}
              onChangeText={(text) => update(index, "contact", text)}
              placeholder="Phone or email"
              placeholderTextColor={placeholderColor}
              autoCorrect={false}
              style={[Styles.input, styles.field, { backgroundColor: inputBg, borderColor: inputBorder, color: inputTextColor }]}
            />
          </View>
        </View>
      ))}
      <Pressable
        style={[styles.add, { borderColor: inputBorder }]}
        onPress={() => onChange([...suppliers, { name: "", contact: "" }])}
      >
        <Plus size={scale(16)} color={Colors.primary} />
        <Text style={[styles.addText, { color: Colors.primary }]}>Add another supplier</Text>
      </Pressable>
    </View>
  );
};

export default SupplierFields;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing(12),
    gap: spacing(10),
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: "medium",
    fontSize: 14,
  },
  field: {
    paddingVertical: 0,
    paddingHorizontal: spacing(16),
  },
  red: {
    color: "rgba(251, 44, 54, 1)",
  },
  add: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(6),
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: spacing(10),
  },
  addText: {
    fontFamily: "medium",
    fontSize: 14,
  },
});
