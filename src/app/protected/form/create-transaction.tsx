import PrimaryButton from "@/src/components/button/PrimaryButton";
import { HapticTab } from "@/src/components/haptic-tab";
import SelectFilterModal from "@/src/components/shared/modal/SelectFilterModal";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { getCurrentUserEmail } from "@/src/lib/auth-utils";
import { generateExpenseId, generateIncomeId } from "@/src/lib/finance";
import { useFinanceStore } from "@/src/stores/financeSlice";
import { Expense, Income } from "@/src/types/finance";
import {
  CapitalizeFirstName,
  formatPrice,
  GetDetailedDate,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router } from "expo-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
} from "lucide-react-native";
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
import DatePicker from "react-native-date-picker";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const Types = [
  {
    label: "Income",
    value: "income",
  },
  {
    label: "Expenses",
    value: "expenses",
  },
];

const CategoryList = [
  {
    label: "Materials",
    value: "materials",
  },
  {
    label: "Rent",
    value: "rent",
  },
  {
    label: "Utilities",
    value: "utilities",
  },
  {
    label: "Equipment",
    value: "equipment",
  },
  {
    label: "Marketing",
    value: "marketing",
  },
  {
    label: "Transportation",
    value: "transportation",
  },
  {
    label: "Meals",
    value: "meals",
  },
  {
    label: "Insurance",
    value: "insurance",
  },
  {
    label: "Taxes",
    value: "taxes",
  },
  {
    label: "Other",
    value: "other",
  },
];

const sourceList = [
  {
    label: "Order Payment",
    value: "order_payment",
  },
  {
    label: "Deposit",
    value: "deposit",
  },
  {
    label: "Alteration",
    value: "alteration",
  },
  {
    label: "Consultation",
    value: "consultation",
  },
  {
    label: "Other",
    value: "other",
  },
];

const parseAmount = (value: string) => {
  if (!value) return NaN;

  const normalized = value.replace(/,/g, "").trim();

  return Number(normalized);
};

const CreateTransactionScreen = () => {
  const saveIncome = useFinanceStore((state) => state.saveIncome);
  const saveExpense = useFinanceStore((state) => state.saveExpense);
  const loading = useFinanceStore((state) => state.loading);

  const [sourceModal, setSourceModal] = useState(false);
  const toggleSourceModal = () => setSourceModal((prev) => !prev);
  const [categoryModal, setCategoryModal] = useState(false);
  const toggleCategoryModal = () => setCategoryModal((prev) => !prev);

  const [showPicker, setShowPicker] = useState(false);

  const [selectedType, setSelectedType] = useState<"income" | "expenses">(
    "income",
  );
  const [transaction, setTransaction] = useState<Income & Expense>({
    id: "",
    description: "",
    amount: 0,
    source: "deposit",
    category: "materials",
    date: new Date().toISOString(),
    notes: "",
    tailorId: "",
    createdAt: "",
    updatedAt: "",
  });

  const [error, setError] = useState({
    amount: "",
    category: "",
    source: "",
    date: "",
    description: "",
  });

  const handleDataChange = (
    field: keyof typeof transaction,
    value: string | number,
  ) => {
    setTransaction({ ...transaction, [field]: value });
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      amount: "",
      category: "",
      source: "",
      date: "",
      description: "",
    };

    const amount = parseAmount(transaction.amount.toString());

    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = "Enter a valid amount";
      isValid = false;
    }

    if (!transaction.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (selectedType === "income") {
      if (!transaction.source) {
        newErrors.source = "Source is required";
        isValid = false;
      }
    }

    if (selectedType === "expenses") {
      if (!transaction.category) {
        newErrors.category = "Category is required";
        isValid = false;
      }
    }

    setError(newErrors);
    return isValid;
  };

  const handleSaveTransaction = async () => {
    if (!validateForm()) return;
    const isIncome = selectedType === "income";
    const amount = parseAmount(transaction.amount.toString());
    const now = new Date().toISOString();
    const { source, category, ...restOfTransaction } = transaction;
    try {
      const payload: Income | Expense = {
        ...restOfTransaction,
        ...(isIncome ? { source: source } : { category: category }),
        id: isIncome ? generateIncomeId() : generateExpenseId(),
        amount,
        tailorId: getCurrentUserEmail(),
        date: now,
        createdAt: now,
        updatedAt: now,
      };

      if (isIncome) {
        await saveIncome(payload as Income);
      } else {
        await saveExpense(payload as Expense);
      }
      setTransaction({
        id: "",
        description: "",
        amount: 0,
        source: "deposit",
        category: "materials",
        date: new Date().toISOString(),
        notes: "",
        tailorId: "",
        createdAt: "",
        updatedAt: "",
      });
      handleBack();
    } catch (err) {
      console.log("Error saving transaction:", err);
    }
  };

  const handleBack = () => {
    router.replace("/(tabs)/Finance");
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

          <Text style={styles.reg24}>Add Transaction</Text>
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
                <Text style={Styles.label}>Type</Text>
                <View style={[styles.row, { gap: spacing(12) }]}>
                  {Types.map((type) => {
                    const isSelected = type.value === selectedType;
                    const isIncome = type.value === "income";
                    const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;

                    const activeColor = isIncome
                      ? {
                          bg: "rgba(0, 201, 80, 0.15)",
                          stroke: "rgba(0, 166, 62, 1)",
                          text: "rgba(0, 166, 62, 1)",
                        }
                      : {
                          bg: "rgba(255, 226, 226, 1)",
                          stroke: "rgba(231, 0, 11, 1)",
                          text: "rgba(231, 0, 11, 1)",
                        };

                    const inactiveColor = {
                      bg: "transparent",
                      stroke: "rgba(229, 231, 235, 1)",
                      text: "rgba(160, 160, 160, 1)",
                    };

                    const colors = isSelected ? activeColor : inactiveColor;

                    return (
                      <Pressable
                        key={type.value}
                        onPress={() => setSelectedType(type.value as any)}
                        style={[
                          styles.tranBox,
                          {
                            backgroundColor: colors.bg,
                            borderColor: colors.stroke,
                          },
                        ]}
                      >
                        <Icon size={scale(20)} color={colors.text} />
                        <Text style={[Styles.reg14, { color: colors.text }]}>
                          {type.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Amount (₦)<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={formatPrice(transaction.amount.toString())}
                  onChangeText={(text) => handleDataChange("amount", text)}
                  placeholder="e.g., 50000"
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
                {error.amount ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.amount}
                  </Text>
                ) : null}
              </View>

              {selectedType === "expenses" ? (
                <Animated.View
                  style={Styles.inputContainer}
                  entering={FadeIn.duration(400)}
                >
                  <Text style={Styles.label}>
                    Category<Text style={styles.red}> *</Text>
                  </Text>
                  <Pressable
                    style={[
                      Styles.input,
                      { ...styles.row, paddingVertical: 0 },
                    ]}
                    onPress={toggleCategoryModal}
                  >
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 1)" }]}
                    >
                      {CapitalizeFirstName(transaction.category)}
                    </Text>

                    <ChevronDown size={scale(20)} color={Colors.grey} />
                  </Pressable>
                </Animated.View>
              ) : (
                <Animated.View
                  style={Styles.inputContainer}
                  entering={FadeIn.duration(400)}
                >
                  <Text style={Styles.label}>
                    Source<Text style={styles.red}> *</Text>
                  </Text>
                  <Pressable
                    style={[
                      Styles.input,
                      { ...styles.row, paddingVertical: 0 },
                    ]}
                    onPress={toggleSourceModal}
                  >
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 1)" }]}
                    >
                      {CapitalizeFirstName(transaction.source)}
                    </Text>

                    <ChevronDown size={scale(20)} color={Colors.grey} />
                  </Pressable>
                </Animated.View>
              )}

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Date<Text style={styles.red}> *</Text>
                </Text>
                <Pressable
                  style={[
                    Styles.input,
                    { ...styles.gapRow, paddingVertical: 0 },
                  ]}
                  onPress={() => setShowPicker(true)}
                >
                  <Calendar size={scale(20)} color={Colors.grey} />
                  {transaction.date ? (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 1)" }]}
                    >
                      {GetDetailedDate(transaction.date)}
                    </Text>
                  ) : (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 0.5)" }]}
                    >
                      Select date
                    </Text>
                  )}
                </Pressable>

                {showPicker && (
                  <DatePicker
                    modal
                    open={showPicker}
                    date={
                      transaction.date ? new Date(transaction.date) : new Date()
                    }
                    mode="date"
                    onConfirm={(date) => {
                      setShowPicker(false);
                      setTransaction({
                        ...transaction,
                        date: date.toISOString(),
                      });
                    }}
                    onCancel={() => {
                      setShowPicker(false);
                    }}
                  />
                )}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Description<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={transaction.description}
                  onChangeText={(text) => handleDataChange("description", text)}
                  placeholder="Add details about this transaction..."
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  autoCorrect={false}
                  multiline
                  numberOfLines={20}
                  style={[
                    Styles.input,
                    {
                      height: 90,
                      textAlignVertical: "top",
                      paddingTop: spacing(15),
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
                {error.description ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.description}
                  </Text>
                ) : null}
              </View>

              <View style={styles.button}>
                <PrimaryButton
                  title="Add Transaction"
                  onPress={handleSaveTransaction}
                  loading={loading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {categoryModal && (
        <SelectFilterModal
          data={CategoryList}
          visible={categoryModal}
          handleOption={(option) => handleDataChange("category", option)}
          selected={transaction.category}
          onClose={() => setCategoryModal(false)}
        />
      )}
      {sourceModal && (
        <SelectFilterModal
          data={sourceList}
          visible={sourceModal}
          handleOption={(option) => handleDataChange("source", option)}
          selected={transaction.source}
          onClose={() => setSourceModal(false)}
        />
      )}
    </>
  );
};

export default CreateTransactionScreen;

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
  gapRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(14),
  },
  tranBox: {
    flex: 1,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing(6),
    borderWidth: 1.1,
    borderRadius: 14,
  },
  button: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
