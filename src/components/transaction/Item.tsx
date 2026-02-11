import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { Expense, Income } from "@/src/types/finance";
import {
  FormatCurrency,
  FormatOrderDate,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router } from "expo-router";
import { ArrowUpCircle, Calendar, ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: Income | Expense;
};

const TransactionItem = ({ item }: Props) => {
  const isExpenses = item.type.toLowerCase() === "expense";
  const bgColor = isExpenses
    ? "rgba(255, 226, 226, 1)"
    : "rgba(220, 252, 231, 1)";
  const textColor = isExpenses ? "rgba(231, 0, 11, 1)" : "rgba(0, 166, 62, 1)";
  // const displayName = isExpenses ? item.category : item.source;

  //   console.log("item", item, displayName);

  return (
    <Pressable
      style={[styles.container]}
      onPress={() =>
        router.push({
          pathname: "/protected/transaction/[id]",
          params: {
            id: item.id,
          },
        })
      }
    >
      <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
        <ArrowUpCircle size={scale(20)} color={textColor} />
      </View>
      <View style={styles.details}>
        <View style={[styles.row, { flexShrink: 1 }]}>
          <Text
            style={[Styles.reg14, { color: Colors.text.black }]}
            numberOfLines={1}
          >
            {item.description}
          </Text>
          <Pressable hitSlop={20}>
            <ChevronRight size={scale(16)} color={"rgba(74, 85, 101, 1)"} />
          </Pressable>
        </View>

        <View style={[styles.startRow, { gap: spacing(5) }]}>
          {/* <View style={styles.typeView}>
            <Text
              style={[
                Styles.reg12,
                { color: "rgba(106, 114, 130, 1)", lineHeight: 16 },
              ]}
            >
              {CapitalizeFirstName(displayName)}
            </Text> */}
          {/* </View> */}

          <Text style={[Styles.reg16, { color: "rgba(106, 114, 130, 1)" }]}>
            {"•"}
          </Text>
          <View style={[styles.startRow, { gap: spacing(5) }]}>
            <Calendar size={scale(12)} color={"rgba(106, 114, 130, 1)"} />
            <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
              {FormatOrderDate(item.date, false)}
            </Text>
          </View>
        </View>

        <View style={[styles.row, { flexShrink: 1 }]}>
          <Text
            style={[Styles.reg16, { color: "rgba(106, 114, 130, 1)" }]}
            numberOfLines={1}
          >
            {item.notes ? item.notes : "No notes"}
          </Text>

          <Text style={[styles.reg18, { color: textColor }]}>
            {isExpenses ? "-" : "+"}
            {FormatCurrency(item.amount)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default TransactionItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(249, 250, 251, 0.2)",
    paddingHorizontal: spacing(16),
    paddingVertical: spacing(8),
    gap: spacing(12),
    borderWidth: 0.3,
    borderRadius: 16,
    borderColor: "rgba(74, 85, 101, 1)",
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconWrapper: {
    width: 48,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  details: {
    flex: 1,
    gap: spacing(8),
    flexShrink: 1,
  },
  typeView: {
    backgroundColor: "rgba(229, 231, 235, 1)",
    paddingHorizontal: spacing(7),
    paddingVertical: spacing(2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  reg18: {
    fontFamily: "medium",
    fontSize: scaleFontSize(18),
    color: Colors.primary,
  },
});
