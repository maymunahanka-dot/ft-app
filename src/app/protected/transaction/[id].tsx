import { HapticTab } from "@/src/components/haptic-tab";
import TransactionItem from "@/src/components/transaction/Item";
import { Colors } from "@/src/constants/theme";
import { useFinanceStore } from "@/src/stores/financeSlice";
import {
  CapitalizeFirstName,
  FormatCurrency,
  FormatOrderDate,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TransactionDetailScreen = () => {
  const { id } = useLocalSearchParams();

  const transactionId = id.toString();

  const loading = useFinanceStore((state) => state.loading);
  const incomes = useFinanceStore((state) => state.income);
  const expenses = useFinanceStore((state) => state.expenses);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const transaction = [...incomes, ...expenses].find(
    (prev) => prev.id === transactionId,
  );

  const isExpense = transaction && transaction.type !== "income";
  const sourceLabel = isExpense ? "Category" : "Source";
  const source = isExpense
    ? (transaction as any)?.category
    : (transaction as any)?.source;

  const handleBack = () => {
    router.replace("/(tabs)/Finance");
  };

  const handleDeleteTransaction = async () => {
    try {
      await deleteTransaction(transaction?.id ?? "");
      handleBack();
    } catch (err) {
      console.error("Error deleting order", err);
    }
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

          <Text style={styles.reg24}>Transaction Details</Text>
        </View>

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
            {transaction && (
              <TransactionItem item={transaction} pressable={false} />
            )}
            <View style={styles.rowDetails}>
              <View style={styles.row}>
                <Text style={[styles.reg14, { fontSize: scaleFontSize(13) }]}>
                  Reference Number
                </Text>
                <Text style={styles.reg13}>{transaction?.id}</Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.reg14, { fontSize: scaleFontSize(13) }]}>
                  Transaction Time
                </Text>
                <Text style={styles.reg13}>
                  {FormatOrderDate(transaction?.date ?? "")}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.reg14, { fontSize: scaleFontSize(13) }]}>
                  {sourceLabel}
                </Text>
                <Text style={styles.reg13}>{CapitalizeFirstName(source)}</Text>
              </View>
            </View>

            <View style={[styles.rowDetails, styles.dashBorder]}>
              <Text style={[styles.reg14, { fontSize: scaleFontSize(13) }]}>
                Amount Breakdown
              </Text>

              <View style={styles.row}>
                <Text style={[styles.reg14, { fontSize: scaleFontSize(13) }]}>
                  Subtotal
                </Text>
                <Text style={styles.reg13}>
                  {FormatCurrency((transaction?.amount ?? 0).toString())}
                </Text>
              </View>

              <View
                style={[
                  styles.row,
                  {
                    borderTopWidth: 0.8,
                    borderTopColor: "#E5E7EB",
                    paddingTop: spacing(12),
                  },
                ]}
              >
                <Text style={styles.reg16}>Total Amount</Text>
                <Text
                  style={[
                    styles.reg24,
                    {
                      fontSize: scaleFontSize(20),
                      color: isExpense ? "#E7000B" : "rgba(0, 166, 62, 1)",
                    },
                  ]}
                >
                  {isExpense ? "-" : "+"}
                  {FormatCurrency((transaction?.amount ?? 0).toString())}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.row,
              {
                gap: spacing(20),
                paddingBottom: spacing(30),
                paddingHorizontal: 16,
              },
            ]}
          >
            <HapticTab
              style={[styles.btn]}
              onPress={() => {
                if (!transaction) return;
                router.push({
                  pathname: "/protected/editTransaction/[id]",
                  params: {
                    id: transaction.id,
                  },
                });
              }}
            >
              <Pencil size={scale(12)} color={"white"} />
              <Text style={[styles.reg14, { color: "white" }]}>Edit</Text>
            </HapticTab>
            <HapticTab
              style={[styles.btn, { backgroundColor: "red" }]}
              onPress={handleDeleteTransaction}
            >
              {loading ? (
                <ActivityIndicator size={scale(20)} color={"white"} />
              ) : (
                <>
                  <Trash2 size={scale(12)} color={"white"} />
                  <Text style={[styles.reg14, { color: "white" }]}>Delete</Text>
                </>
              )}
            </HapticTab>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default TransactionDetailScreen;

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
  reg13: {
    fontFamily: "regular",
    fontSize: scaleFontSize(13),
    color: Colors.text.black,
    textAlign: "right",
    flexShrink: 1,
  },
  reg14: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: "#6A7282",
  },
  reg16: {
    fontFamily: "regular",
    fontSize: scaleFontSize(16),
    color: Colors.text.black,
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
    paddingHorizontal: 16,
    gap: spacing(16),
    paddingTop: spacing(30),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing(20),
  },
  gapRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(12),
  },
  red: {
    color: "rgba(251, 44, 54, 1)",
  },
  rowDetails: {
    gap: spacing(16),
    marginBottom: spacing(10),
  },
  dashBorder: {
    borderStyle: "dashed",
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
    paddingTop: spacing(10),
  },
  btn: {
    flex: 1,
    backgroundColor: Colors.black,
    height: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing(20),
    borderRadius: 20,
  },
});
