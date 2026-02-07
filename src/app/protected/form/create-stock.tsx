import PrimaryButton from "@/src/components/button/PrimaryButton";
import { HapticTab } from "@/src/components/haptic-tab";
import SelectFilterModal from "@/src/components/shared/modal/SelectFilterModal";
import { categoryList, statusList, unitList } from "@/src/constants/config";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { getCurrentUserEmail } from "@/src/lib/auth-utils";
import { generateInventoryId } from "@/src/lib/inventory";
import { useInventoryStore } from "@/src/stores/inventorySlice";
import { InventoryItem } from "@/src/types/inventory";
import {
  CapitalizeFirstName,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router } from "expo-router";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CreateStockItemScreen = () => {
  const saveItem = useInventoryStore((state) => state.saveInventoryItem);
  const loading = useInventoryStore((state) => state.loading);

  const [categoryModal, setCategoryModal] = useState(false);
  const toggleCategoryModal = () => setCategoryModal((prev) => !prev);
  const [unitModal, setUnitModal] = useState(false);
  const toggleUnitModal = () => setUnitModal((prev) => !prev);
  const [statusModal, setStatusModal] = useState(false);
  const toggleStatusModal = () => setStatusModal((prev) => !prev);

  const [stockData, setStockData] = useState<InventoryItem>({
    id: generateInventoryId(),
    name: "",
    category: "accessory",
    description: "",
    supplier: "",
    color: "",
    material: "",
    quantity: 0,
    unit: "yards",
    minStockLevel: 0,
    costPerUnit: 0,
    sellingPricePerUnit: 0,
    totalValue: 0,
    status: "in-stock",
    purchaseDate: "",
    notes: "",
    tailorId: "",
    createdAt: "",
    updatedAt: "",
  });

  const [error, setError] = useState({
    name: "",
    supplier: "",
    quantity: "",
    sellingPricePerUnit: "",
  });

  const handleDataChange = (
    field: keyof typeof stockData,
    value: string | number,
  ) => {
    setStockData({ ...stockData, [field]: value });
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newError = {
      name: "",
      supplier: "",
      quantity: "",
      sellingPricePerUnit: "",
    };

    let isValid = true;

    if (!stockData.name.trim()) {
      newError.name = "Item name is required";
      isValid = false;
    }

    if (!stockData.supplier.trim()) {
      newError.supplier = "Supplier is required";
      isValid = false;
    }

    if (!stockData.quantity || stockData.quantity <= 0) {
      newError.quantity = "Quantity must be greater than 0";
      isValid = false;
    }

    if (!stockData.sellingPricePerUnit || stockData.sellingPricePerUnit <= 0) {
      newError.sellingPricePerUnit = "Selling price must be greater than 0";
      isValid = false;
    }

    setError(newError);
    return isValid;
  };

  const handleCreateStock = async () => {
    const isValid = validateForm();
    console.log("creating", isValid);

    if (!isValid) return;

    try {
      const payload: InventoryItem = {
        ...stockData,
        totalValue: stockData.quantity * stockData.sellingPricePerUnit,
        tailorId: getCurrentUserEmail(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveItem(payload);
      handleBack();
    } catch (error) {
      console.log("Error creating inventory item:", error);
    }
  };

  const handleBack = () => {
    router.replace("/(tabs)/Inventory");
  };

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, paddingTop: spacing(20), backgroundColor: "white" }}
      >
        <View style={styles.header}>
          <HapticTab
            style={{
              width: 32,
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleBack}
          >
            <ChevronLeft
              size={scale(20)}
              color={"rgba(54, 65, 83, 1)"}
              strokeWidth={1.5}
            />
          </HapticTab>

          <Text style={styles.reg24}>Add Inventory Item</Text>
        </View>

        <KeyboardAvoidingView
          style={{
            flex: 1,
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
              paddingVertical: spacing(30),
            }}
            keyboardDismissMode="interactive"
          >
            <View style={styles.content}>
              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Name<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={stockData.name}
                  onChangeText={(text) => handleDataChange("name", text)}
                  placeholder="e.g., Ankara Print Fabric"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[
                    Styles.input,
                    {
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
                {error.name ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.name}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Category</Text>
                <Pressable
                  style={[Styles.input, { ...styles.row, paddingVertical: 0 }]}
                  onPress={toggleCategoryModal}
                >
                  <Text
                    style={[Styles.reg16, { color: "rgba(10, 10, 10, 0.5)" }]}
                  >
                    {CapitalizeFirstName(stockData.category)}
                  </Text>

                  <ChevronDown size={scale(20)} color={Colors.grey} />
                </Pressable>
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Supplier<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={stockData.supplier}
                  onChangeText={(text) => handleDataChange("supplier", text)}
                  placeholder="e.g., Lagos Textiles Ltd"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  autoCorrect={false}
                  style={[
                    Styles.input,
                    {
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
                {error.supplier ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.supplier}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <View style={[styles.row, { gap: spacing(20) }]}>
                  <View style={[Styles.inputContainer, { flex: 1 }]}>
                    <Text style={Styles.label}>
                      Quantity<Text style={styles.red}> *</Text>
                    </Text>
                    <TextInput
                      value={stockData.quantity.toString()}
                      onChangeText={(text) =>
                        handleDataChange("quantity", Number(text))
                      }
                      placeholder="Quantity"
                      placeholderTextColor={Colors.grayText}
                      returnKeyLabel="next"
                      returnKeyType="next"
                      keyboardType="number-pad"
                      autoCorrect={false}
                      style={[
                        Styles.input,
                        {
                          paddingVertical: 0,
                          backgroundColor: "white",
                          paddingHorizontal: spacing(16),
                        },
                      ]}
                    />
                  </View>
                  <View style={[Styles.inputContainer, { flex: 1 }]}>
                    <Text style={Styles.label}>Unit</Text>
                    <Pressable
                      style={[
                        Styles.input,
                        { ...styles.row, paddingVertical: 0 },
                      ]}
                      onPress={toggleUnitModal}
                    >
                      <Text
                        style={[
                          Styles.reg16,
                          { color: "rgba(10, 10, 10, 0.5)" },
                        ]}
                      >
                        {CapitalizeFirstName(stockData.unit)}
                      </Text>

                      <ChevronDown size={scale(20)} color={Colors.grey} />
                    </Pressable>
                  </View>
                </View>
                {error.quantity ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.quantity}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Status</Text>
                <Pressable
                  style={[Styles.input, { ...styles.row, paddingVertical: 0 }]}
                  onPress={toggleStatusModal}
                >
                  <Text
                    style={[Styles.reg16, { color: "rgba(10, 10, 10, 0.5)" }]}
                  >
                    {CapitalizeFirstName(
                      statusList.find((s) => s.value === stockData.status)
                        ?.label ?? stockData.status,
                    )}
                  </Text>

                  <ChevronDown size={scale(20)} color={Colors.grey} />
                </Pressable>
              </View>

              <View style={Styles.inputContainer}>
                <View style={[styles.row, { gap: spacing(20) }]}>
                  <View style={[Styles.inputContainer, { flex: 1 }]}>
                    <Text style={Styles.label}>
                      Price per Unit (₦)<Text style={styles.red}> *</Text>
                    </Text>
                    <TextInput
                      value={stockData.sellingPricePerUnit.toString()}
                      onChangeText={(text) =>
                        handleDataChange("sellingPricePerUnit", Number(text))
                      }
                      placeholder="Price per unit"
                      placeholderTextColor={Colors.grayText}
                      returnKeyLabel="next"
                      returnKeyType="next"
                      keyboardType="number-pad"
                      autoCorrect={false}
                      style={[
                        Styles.input,
                        {
                          paddingVertical: 0,
                          backgroundColor: "white",
                          paddingHorizontal: spacing(16),
                        },
                      ]}
                    />
                  </View>
                  <View style={[Styles.inputContainer, { flex: 1 }]}>
                    <Text style={Styles.label}>Min Stock Alert</Text>
                    <TextInput
                      value={stockData.minStockLevel.toString()}
                      onChangeText={(text) =>
                        handleDataChange("minStockLevel", Number(text))
                      }
                      placeholder="Minimum Stock Level"
                      placeholderTextColor={Colors.grayText}
                      returnKeyLabel="next"
                      returnKeyType="next"
                      keyboardType="number-pad"
                      autoCorrect={false}
                      style={[
                        Styles.input,
                        {
                          paddingVertical: 0,
                          backgroundColor: "white",
                          paddingHorizontal: spacing(16),
                        },
                      ]}
                    />
                  </View>
                </View>
                {error.sellingPricePerUnit ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.sellingPricePerUnit}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Description</Text>
                <TextInput
                  value={stockData.description}
                  onChangeText={(text) => handleDataChange("description", text)}
                  placeholder="Add notes about this item..."
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  autoCorrect={false}
                  multiline
                  numberOfLines={20}
                  style={[
                    Styles.input,
                    {
                      height: 100,
                      textAlignVertical: "top",
                      paddingTop: spacing(15),
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
              </View>

              <View style={styles.button}>
                <PrimaryButton
                  title="Add Item"
                  onPress={handleCreateStock}
                  loading={loading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {categoryModal && (
        <SelectFilterModal
          data={categoryList}
          visible={categoryModal}
          handleOption={(option) => handleDataChange("category", option)}
          selected={stockData.category}
          onClose={() => setCategoryModal(false)}
        />
      )}
      {statusModal && (
        <SelectFilterModal
          data={statusList}
          visible={statusModal}
          handleOption={(option) => handleDataChange("status", option)}
          selected={stockData.status}
          onClose={() => setStatusModal(false)}
        />
      )}
      {unitModal && (
        <SelectFilterModal
          data={unitList}
          visible={unitModal}
          handleOption={(option) => handleDataChange("unit", option)}
          selected={stockData.unit}
          onClose={() => setUnitModal(false)}
        />
      )}
    </>
  );
};

export default CreateStockItemScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: spacing(8),
  },
  col: {
    gap: spacing(4),
  },
  reg24: {
    fontFamily: "regular",
    fontSize: scaleFontSize(24),
    color: "rgba(54, 65, 83, 1)",
    lineHeight: 32,
  },
  reg30: {
    fontFamily: "regular",
    fontSize: scaleFontSize(30),
    color: "white",
    lineHeight: 36,
  },
  content: {
    flex: 1,
    // paddingVertical: spacing(20),
    paddingHorizontal: 16,
    gap: spacing(14),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  red: {
    color: "rgba(251, 44, 54, 1)",
  },
  button: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
