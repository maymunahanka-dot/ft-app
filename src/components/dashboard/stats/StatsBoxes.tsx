import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useClientStore } from "@/src/stores/clientSlice";
import { useFinanceStore } from "@/src/stores/financeSlice";
import { useInventoryStore } from "@/src/stores/inventorySlice";
import { useOrderStore } from "@/src/stores/orderSlice";
import { useUserStore } from "@/src/stores/userSlice";
import { GetNewClientsCount } from "@/src/types/client";
import { GetMonthlyIncomeChangeValue } from "@/src/types/finance";
import { GetInStockCount, GetTotalInventoryValue } from "@/src/types/inventory";
import { GetOrdersDueThisWeekCount } from "@/src/types/Order";
import {
  FormatNairaShorthand,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { FontAwesome } from "@expo/vector-icons";
import { Box, CircleDollarSign, FileText } from "lucide-react-native";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const StatsBoxes = () => {
  const user = useUserStore((state) => state.user);

  const income = useFinanceStore((state) => state.income);
  const revenue = income.reduce(
    (acc, item) =>
      acc + (typeof item === "number" ? item : (item?.amount ?? 0)),
    0,
  );
  const percentageLabel = GetMonthlyIncomeChangeValue(income);
  const isPositive = percentageLabel >= 0;
  const statusColor = isPositive ? Colors.primary : "red";
  const displayValue = isPositive
    ? `+${percentageLabel}%`
    : `${percentageLabel}%`;

  const clients = useClientStore((state) => state.clients);
  const newClientsThisMonth = GetNewClientsCount(clients);

  const orders = useOrderStore((state) => state.orders);
  const dueCount = GetOrdersDueThisWeekCount(orders);

  const stocks = useInventoryStore((state) => state.stocks);
  const totalInStock = GetInStockCount(stocks);
  const inventoryValue = GetTotalInventoryValue(stocks);

  const fetchExpenses = useFinanceStore((state) => state.getExpensesByTailor);
  const fetchIncome = useFinanceStore((state) => state.getIncomeByTailor);
  const fetchClients = useClientStore((state) => state.getClientsByTailor);
  const fetchOrders = useOrderStore((state) => state.getOrdersByTailor);
  const fetchStocks = useInventoryStore((state) => state.getInventoryByTailor);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      await Promise.all([
        fetchIncome(user.email),
        fetchExpenses(user.email),
        fetchClients(user.email),
        fetchOrders(user.email),
        fetchStocks(user.email),
      ]);
      console.log(
        "fetched data success!!",
        orders[0],
        revenue,
        clients[0],
        inventoryValue,
      );
    } catch (error) {
      console.error("error fetching data", error);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.box}>
          <View style={styles.startRow}>
            <CircleDollarSign
              size={scale(20)}
              strokeWidth={2}
              color={Colors.tintTabColor}
            />
            <Text style={styles.med24}>
              {FormatNairaShorthand(`${revenue}`)}
            </Text>
          </View>

          <Text style={[Styles.reg14, { color: Colors.text.black }]}>
            Total Revenue
          </Text>
          <Text style={[Styles.reg12, { color: statusColor }]}>
            {displayValue} from last month
          </Text>
        </View>
        <View style={styles.box}>
          <View style={styles.startRow}>
            <FontAwesome
              name="users"
              size={scale(18)}
              strokeWidth={2}
              color={Colors.tintTabColor}
            />

            <Text style={styles.med24}>{clients.length}</Text>
            <Text style={[Styles.reg14, { color: Colors.grey }]}>clients</Text>
          </View>

          <Text style={[Styles.reg14, { color: Colors.text.black }]}>
            Active Clients
          </Text>
          <Text style={[Styles.reg12, { color: Colors.primary }]}>
            {newClientsThisMonth} new this month
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.box}>
          <View style={styles.startRow}>
            <FileText
              size={scale(18)}
              strokeWidth={2}
              color={Colors.tintTabColor}
            />

            <Text style={styles.med24}>{orders.length}</Text>
            <Text style={[Styles.reg14, { color: Colors.grey }]}>orders</Text>
          </View>

          <Text style={[Styles.reg14, { color: Colors.text.black }]}>
            Pending Orders
          </Text>
          <Text style={[Styles.reg12, { color: Colors.primary }]}>
            {dueCount} due this week
          </Text>
        </View>

        <View style={styles.box}>
          <View style={styles.startRow}>
            <Box size={scale(20)} strokeWidth={2} color={Colors.tintTabColor} />
            <Text style={styles.med24}>
              {FormatNairaShorthand(`${inventoryValue}`)}
            </Text>
          </View>

          <Text style={[Styles.reg14, { color: Colors.text.black }]}>
            Inventory Value
          </Text>
          <Text style={[Styles.reg12, { color: Colors.primary }]}>
            {totalInStock} items in stock
          </Text>
        </View>
      </View>
    </View>
  );
};

export default StatsBoxes;

const styles = StyleSheet.create({
  container: {
    gap: spacing(18),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  box: {
    width: "47%",
    height: 130,
    padding: spacing(16),
    backgroundColor: "rgba(249, 250, 251, 0.2)",
    gap: spacing(8),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.25)",
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(8),
  },
  med24: {
    fontFamily: "medium",
    fontSize: scaleFontSize(24),
    lineHeight: 32,
    color: Colors.text.black,
  },
});
