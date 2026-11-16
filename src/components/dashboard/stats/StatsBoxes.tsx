import MoneyAmount from "@/src/components/shared/MoneyAmount";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { FontAwesome } from "@expo/vector-icons";
import { Box, CircleDollarSign, FileText } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";

interface StatsBoxesProps {
  totalRevenue: number;
  revenueGrowth: number;
  activeClients: number;
  newClientsThisMonth: number;
  pendingOrders: number;
  ordersThisWeek: number;
  inventoryValue: number;
  totalInventoryItems: number;
}

const StatsBoxes: React.FC<StatsBoxesProps> = ({
  totalRevenue,
  revenueGrowth,
  activeClients,
  newClientsThisMonth,
  pendingOrders,
  ordersThisWeek,
  inventoryValue,
  totalInventoryItems,
}) => {
  const { t: tx } = useTranslation();
  const { isDark } = useTheme();

  const boxBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(249, 250, 251, 1)";
  const boxBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? Colors.text.white : Colors.text.black;
  const subTextColor = isDark ? "rgba(160,160,160,1)" : Colors.grey;

  const isPositive = revenueGrowth >= 0;
  const statusColor = isPositive ? Colors.primary : "red";
  const displayValue = isPositive
    ? `+${revenueGrowth.toFixed(1)}%`
    : `${revenueGrowth.toFixed(1)}%`;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.box, { backgroundColor: boxBg, borderColor: boxBorder }]}>
          <View style={styles.startRow}>
            <CircleDollarSign size={scale(20)} strokeWidth={2} color={Colors.tintTabColor} />
            <MoneyAmount amount={Number(totalRevenue) || 0} color={textColor} primarySize={20} />
          </View>
          <Text style={[Styles.reg14, { color: textColor }]}>{tx("auto.totalRevenue_f3a8")}</Text>
          <Text style={[Styles.reg12, { color: statusColor }]}>{displayValue}{" "}{tx("auto.fromLastMonth_e945")}</Text>
        </View>

        <View style={[styles.box, { backgroundColor: boxBg, borderColor: boxBorder }]}>
          <View style={styles.startRow}>
            <FontAwesome name="users" size={scale(18)} color={Colors.tintTabColor} />
            <Text style={[styles.med24, { color: textColor }]}>{activeClients}</Text>
            <Text style={[Styles.reg14, { color: subTextColor }]}>{tx("auto.clients_93df")}</Text>
          </View>
          <Text style={[Styles.reg14, { color: textColor }]}>{tx("auto.activeClients_c182")}</Text>
          <Text style={[Styles.reg12, { color: Colors.primary }]}>
            {newClientsThisMonth}{" "}{tx("auto.newThisMonth_9107")}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.box, { backgroundColor: boxBg, borderColor: boxBorder }]}>
          <View style={styles.startRow}>
            <FileText size={scale(18)} strokeWidth={2} color={Colors.tintTabColor} />
            <Text style={[styles.med24, { color: textColor }]}>{pendingOrders}</Text>
            <Text style={[Styles.reg14, { color: subTextColor }]}>{tx("auto.orders_9658")}</Text>
          </View>
          <Text style={[Styles.reg14, { color: textColor }]}>{tx("auto.pendingOrders_2a94")}</Text>
          <Text style={[Styles.reg12, { color: Colors.primary }]}>{ordersThisWeek}{" "}{tx("auto.dueThisWeek_5fca")}</Text>
        </View>

        <View style={[styles.box, { backgroundColor: boxBg, borderColor: boxBorder }]}>
          <View style={styles.startRow}>
            <Box size={scale(20)} strokeWidth={2} color={Colors.tintTabColor} />
            <MoneyAmount amount={Number(inventoryValue) || 0} color={textColor} primarySize={20} />
          </View>
          <Text style={[Styles.reg14, { color: textColor }]}>{tx("auto.inventoryValue_d96f")}</Text>
          <Text style={[Styles.reg12, { color: Colors.primary }]}>
            {totalInventoryItems}{" "}{tx("auto.itemsInStock_2b49")}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default StatsBoxes;

const styles = StyleSheet.create({
  container: { gap: spacing(18) },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  box: {
    width: "47%",
    minHeight: 130,
    padding: spacing(16),
    gap: spacing(8),
    borderRadius: 20,
    borderWidth: 1,
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
  },
});
