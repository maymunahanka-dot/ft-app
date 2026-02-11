import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { Order } from "@/src/types/Order";
import {
  CapitalizeFirstName,
  FormatNairaShorthand,
  FormatOrderDate,
  scale,
  spacing,
} from "@/src/utils/random";
import { router } from "expo-router";
import { Box } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  order: Order;
};

const OrderItem = ({ order }: Props) => {
  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";

  const textColor = isCompleted
    ? "rgba(0, 130, 54, 1)"
    : isCancelled
      ? "rgba(193, 0, 7, 1)"
      : "rgba(20, 71, 230, 1)";
  const bgColor = isCompleted
    ? "rgba(220, 252, 231, 1)"
    : isCancelled
      ? "rgba(255, 226, 226, 1)"
      : "rgba(239, 246, 255, 1)";

  return (
    <Pressable
      style={styles.orderCard}
      onPress={() =>
        router.push({
          pathname: "/protected/order/[id]",
          params: { id: order.id },
        })
      }
    >
      <View style={[styles.startRow, { gap: spacing(12) }]}>
        <View style={styles.iconWrapper}>
          <Box size={scale(18)} color={Colors.primary} />
        </View>

        <View style={[styles.col, { gap: spacing(4) }]}>
          <Text style={[Styles.reg14, { color: Colors.text.black }]}>
            {CapitalizeFirstName(order.garmentDescription)}
          </Text>
          <Text style={[Styles.reg12, { color: Colors.text.gray }]}>
            {FormatOrderDate(order.createdAt)}
          </Text>
        </View>
      </View>

      <View style={[styles.col, { gap: spacing(4), alignItems: "flex-end" }]}>
        <Text style={[Styles.reg14, { color: Colors.text.black }]}>
          {FormatNairaShorthand(order.price.toString())}
        </Text>

        <View style={[styles.badgeView, { backgroundColor: bgColor }]}>
          <Text style={[Styles.reg12, { lineHeight: 16, color: textColor }]}>
            {CapitalizeFirstName(order.status)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default OrderItem;

const styles = StyleSheet.create({
  orderCard: {
    paddingVertical: spacing(20),
    paddingHorizontal: spacing(16),
    gap: spacing(12),
    backgroundColor: "rgba(249, 250, 251, 1)",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrapper: {
    width: 40,
    aspectRatio: 1,
    backgroundColor: "rgba(232, 245, 244, 1)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  col: {
    gap: spacing(16),
  },
  badgeView: {
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(8),
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
