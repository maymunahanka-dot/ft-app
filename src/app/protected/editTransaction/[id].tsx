import PrimaryButton from "@/src/components/button/PrimaryButton";
import { HapticTab } from "@/src/components/haptic-tab";
import { formatFirestoreTimestampToISO } from "@/src/components/invoice/util";
import SelectFilterModal from "@/src/components/shared/modal/SelectFilterModal";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { getCurrentUserEmail } from "@/src/lib/auth-utils";
import { generateExpenseId, generateIncomeId } from "@/src/lib/finance";
import { useFinanceStore } from "@/src/stores/financeSlice";
import { Expense, Income, TransactionType } from "@/src/types/finance";
import {
  CapitalizeFirstName,
  formatPrice,
  GetDetailedDate,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { SafeAreaView } from "react-native-safe-area-context";

const Types = [
  {
    label: "Income",
    value: "income",
  },
  {
    label: "Expenses",
    value: "expense",
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

const EditTransactionScreen = () => {
  const { id } = useLocalSearchParams();

  const transactionId = id.toString();

  const loading = useFinanceStore((state) => state.loading);
  const incomes = useFinanceStore((state) => state.income);
  const expenses = useFinanceStore((state) => state.expenses);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const transaction = [...incomes, ...expenses].find(
    (prev) => prev.id === transactionId,
  );
  const editTransaction = useFinanceStore((state) => state.editTransaction);

  const [sourceModal, setSourceModal] = useState(false);
  const toggleSourceModal = () => setSourceModal((prev) => !prev);
  const [categoryModal, setCategoryModal] = useState(false);
  const toggleCategoryModal = () => setCategoryModal((prev) => !prev);

  const [showPicker, setShowPicker] = useState(false);

  const [selectedType, setSelectedType] = useState<TransactionType>(
    (transaction?.type.toLowerCase() as any) ?? "income",
  );
  const isExpenses = transaction && "category" in transaction;
  const sourceLabel = isExpenses ? transaction?.category : transaction?.source;
  const [transactionDetails, setTransactionDetails] = useState<
    Income & Expense
  >({
    id: transaction?.id ?? "",
    description: transaction?.description ?? "",
    type: transaction?.type ?? selectedType,
    amount: transaction?.amount ?? 0,
    source: (sourceLabel as any) ?? "deposit",
    category: (sourceLabel as any) ?? "materials",
    date: transaction?.date
      ? formatFirestoreTimestampToISO(transaction.date as any)
      : new Date().toISOString(),
    notes: transaction?.notes ?? "",
    userEmail: transaction?.userEmail ?? "",
    createdAt: transaction?.createdAt ?? "",
    updatedAt: transaction?.updatedAt ?? "",
  });

  const [error, setError] = useState({
    amount: "",
    category: "",
    source: "",
    date: "",
    description: "",
  });

  const handleDataChange = (
    field: keyof typeof transactionDetails,
    value: string | number,
  ) => {
    setTransactionDetails({ ...transactionDetails, [field]: value });
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

    const amount = parseAmount(transactionDetails.amount.toString());

    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = "Enter a valid amount";
      isValid = false;
    }

    if (!transactionDetails.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (selectedType === "income") {
      if (!transactionDetails.source) {
        newErrors.source = "Source is required";
        isValid = false;
      }
    }

    if (selectedType === "expense") {
      if (!transactionDetails.category) {
        newErrors.category = "Category is required";
        isValid = false;
      }
    }

    setError(newErrors);
    return isValid;
  };

  const handleEditTransaction = async () => {
    if (!validateForm() || !transaction) return;
    const isIncome = selectedType === "income";
    const amount = parseAmount(transactionDetails.amount.toString());
    const now = new Date().toISOString();
    const { source, category, ...restOfTransaction } = transactionDetails;
    try {
      const payload: Income | Expense = {
        ...restOfTransaction,
        ...(isIncome ? { source: source } : { category: category }),
        id: isIncome ? generateIncomeId() : generateExpenseId(),
        amount,
        userEmail: getCurrentUserEmail(),
        date: now,
        createdAt: now,
        updatedAt: now,
      };

      await editTransaction(transaction.id, payload, selectedType);
      setTransactionDetails({
        id: "",
        type: selectedType,
        description: "",
        amount: 0,
        source: "deposit",
        category: "materials",
        date: new Date().toISOString(),
        notes: "",
        userEmail: "",
        createdAt: "",
        updatedAt: "",
      });
      handleBack();
    } catch (err) {
      console.log("Error saving transaction:", err);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    try {
      await deleteTransaction(transaction.id);
      handleBack();
    } catch (err) {
      console.error("Error deleting transaction", err);
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
        <View style={[styles.row, { paddingHorizontal: spacing(16) }]}>
          <View style={styles.header}>
            <HapticTab
              style={{
                height: 32,
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

            <Text style={styles.reg24}>Edit Transaction</Text>
          </View>

          <Pressable onPress={handleDelete}>
            {loading ? (
              <ActivityIndicator size={scale(20)} color={"red"} />
            ) : (
              <Trash2 size={scale(20)} color={"red"} strokeWidth={1.5} />
            )}
          </Pressable>
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
                        onPress={() => {
                          setSelectedType(type.value as TransactionType);
                        }}
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
                  value={formatPrice(transactionDetails.amount.toString())}
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

              {selectedType === "expense" ? (
                <View style={Styles.inputContainer} key={selectedType}>
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
                      {CapitalizeFirstName(transactionDetails.category)}
                    </Text>

                    <ChevronDown size={scale(20)} color={Colors.grey} />
                  </Pressable>
                </View>
              ) : (
                <View style={Styles.inputContainer} key={selectedType}>
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
                      {CapitalizeFirstName(transactionDetails.source)}
                    </Text>

                    <ChevronDown size={scale(20)} color={Colors.grey} />
                  </Pressable>
                </View>
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
                  {transactionDetails.date ? (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 1)" }]}
                    >
                      {GetDetailedDate(transactionDetails.date)}
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
                      transactionDetails.date
                        ? new Date(transactionDetails.date)
                        : new Date()
                    }
                    mode="date"
                    onConfirm={(date) => {
                      setShowPicker(false);
                      setTransactionDetails({
                        ...transactionDetails,
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
                  value={transactionDetails.description}
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
                  title="Edit Transaction"
                  onPress={handleEditTransaction}
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
          selected={transactionDetails.category}
          onClose={() => setCategoryModal(false)}
        />
      )}
      {sourceModal && (
        <SelectFilterModal
          data={sourceList}
          visible={sourceModal}
          handleOption={(option) => handleDataChange("source", option)}
          selected={transactionDetails.source}
          onClose={() => setSourceModal(false)}
        />
      )}
    </>
  );
};

export default EditTransactionScreen;

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
