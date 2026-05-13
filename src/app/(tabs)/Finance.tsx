import GlassCard from "@/src/components/dashboard/boxes/GlassBox";
import IncomeExpenseChart from "@/src/components/finance/IncomeExpenseChart";
import BGScreenBG from "@/src/components/shared/BGScreenBG";
import TransactionItem from "@/src/components/transaction/Item";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useFinanceStore } from "@/src/stores/financeSlice";
import { Expense, Income } from "@/src/types/finance";
import {
  FormatCurrency,
  GetCurrentMonthYear,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Financial Analytics
export function calculateFinancialSummary(
  income: Income[],
  expenses: Expense[],
) {
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Current month calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyIncome = income
    .filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlyExpenses = expenses
    .filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const monthlyProfit = monthlyIncome - monthlyExpenses;

  return {
    totalIncome,
    totalExpenses,
    netProfit,
    profitMargin,
    monthlyIncome,
    monthlyExpenses,
    monthlyProfit,
  };
}

const RowBoxes = () => {
  const finance = useFinanceStore();

  const summary = calculateFinancialSummary(finance.income, finance.expenses);

  return (
    <View style={{ gap: spacing(13) }}>
      <View style={styles.row}>
        <GlassCard style={styles.box}>
          <Text style={[Styles.reg14, { color: "white", lineHeight: 18 }]}>
            Net Profit
          </Text>
          <Text style={styles.valueBox}>
            {FormatCurrency(summary.netProfit)}
          </Text>
        </GlassCard>

        <GlassCard style={styles.box}>
          <Text style={[Styles.reg14, { color: "white", lineHeight: 18 }]}>
            Total Income
          </Text>
          <Text style={styles.valueBox}>
            {FormatCurrency(summary.totalIncome)}
          </Text>
        </GlassCard>
      </View>
      <View style={styles.row}>
        <GlassCard style={styles.box}>
          <Text style={[Styles.reg14, { color: "white", lineHeight: 18 }]}>
            Total Expenses
          </Text>
          <Text style={styles.valueBox}>
            {FormatCurrency(summary.totalExpenses)}
          </Text>
        </GlassCard>

        <GlassCard style={styles.box}>
          <Text style={[Styles.reg14, { color: "white", lineHeight: 18 }]}>
            Monthly Profit
          </Text>
          <Text style={styles.valueBox}>
            {FormatCurrency(summary.monthlyProfit)}
          </Text>
        </GlassCard>
      </View>
    </View>
  );
};

const FinanceScreen = () => {
  const loading = useFinanceStore((state) => state.loading);
  const incomes = useFinanceStore((state) => state.income);
  const expenses = useFinanceStore((state) => state.expenses);
  const fetchTransactions = useFinanceStore(
    (state) => state.getTransactionsByTailor,
  );

  useEffect(() => {
    fetchTransactions("");
  }, []);

  const hasTransactions = incomes.length > 0 || expenses.length > 0;

  console.log("transactions", incomes, expenses);

  console.log("transactions", incomes, expenses);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["bottom"]}
    >
      <BGScreenBG
        title="Financial Dashboard"
        subText
        text={`${GetCurrentMonthYear()}`}
        rightIcon={() => <View style={{}}></View>}
        headerChildren={RowBoxes}
        height={410}
        drawer
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing(50) }}
          horizontal={false}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
          <View style={styles.content}>
            <Pressable
              onPress={() => router.push("/protected/form/create-transaction")}
              style={styles.addBtn}
            >
              <Plus size={scale(16)} color={"white"} />
              <Text style={[Styles.reg16, { color: "white" }]}>
                Add Transaction
              </Text>
            </Pressable>
            {hasTransactions ? (
              <IncomeExpenseChart incomes={incomes} expenses={expenses} />
            ) : (
              <View style={styles.emptyChartContainer}>
                <Text style={styles.emptyChartText}>
                  No transactions yet. Add your first transaction to see your
                  financial overview.
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={[Styles.reg16, { color: Colors.text.black }]}>
                  Recent Transactions
                </Text>
                {/* <Pressable onPress={() => {}}>
                  <Text style={[Styles.reg16, { color: Colors.secondary }]}>
                    View All
                  </Text>
                </Pressable> */}
              </View>

              {/* recent transactions */}
              {/* recent transactions */}
              {loading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size={"small"} color={"black"} />
                </View>
              ) : hasTransactions ? (
                [...incomes, ...expenses]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((transaction, index) => (
                    <TransactionItem
                      key={transaction.id || index}
                      item={transaction}
                    />
                  ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No transactions to display
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </BGScreenBG>
    </SafeAreaView>
  );
};

export default FinanceScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing(25),
    paddingTop: spacing(26),
  },
  section: {
    gap: spacing(16),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: "48%",
    height: 95,
    padding: spacing(17),
    // gap: spacing(20),
    flexDirection: "column",
    justifyContent: "space-between",
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(4),
  },
  valueBox: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(24),
    lineHeight: 28,
    color: "white",
  },
  addBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: spacing(8),
    gap: spacing(5),
    height: 40,
    borderRadius: 12,
  },
  emptyChartContainer: {
    padding: spacing(30),
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  emptyChartText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyState: {
    padding: spacing(30),
    alignItems: "center",
  },
  emptyStateText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: "#999",
  },
});
