import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useInventoryStore } from "@/src/stores/inventorySlice";
import { InventoryItem } from "@/src/types/inventory";
import {
  CapitalizeFirstName,
  FormatCurrency,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Eye, Trash2 } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: InventoryItem;
};

const Icons = {
  fabrics: "🧵",
  notion: "📌",
  threads: "🧶",
  accessories: "💎",
  tools: "✂️",
  pattern: "📐",
  trim: "🎀",
} as const;

const StockItem = ({ item }: Props) => {
  const deleteItem = useInventoryStore((state) => state.deleteInventoryItem);

  const outOfStock = item.status === "out-of-stock";
  const lowStock =
    item.status === "low-stock" ||
    item.status === "out-of-stock" ||
    item.quantity <= (item.minStockLevel ?? 1);
  const alert = outOfStock
    ? "Out of Stock"
    : lowStock
      ? "Low Stock"
      : "Sufficient";

  const bgColor = lowStock
    ? "rgba(254, 249, 194, 1)"
    : "rgba(198, 233, 212, 1)";
  const textColor = lowStock ? "rgba(166, 95, 0, 1)" : "rgba(21, 177, 83, 0.9)";

  const handleDelete = () => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteItem(item.id) },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.row, { alignItems: "flex-start" }]}>
        <View style={[styles.startRow, { gap: spacing(12) }]}>
          <LinearGradient
            colors={["rgba(22, 152, 141, 1)", "rgba(13, 107, 98, 1)"]}
            style={styles.iconWrapper}
          >
            <Text
              style={{
                fontFamily: "regular",
                fontSize: scaleFontSize(24),
                lineHeight: 32,
              }}
            >
              {Icons[item.category.toString() as keyof typeof Icons]}
            </Text>
          </LinearGradient>

          <View style={{ gap: spacing(5) }}>
            <Text style={[Styles.reg14, { color: Colors.text.black }]}>
              {item.name}
            </Text>
            <View style={[styles.gapRow, { gap: spacing(8) }]}>
              <View style={styles.typeView}>
                <Text
                  style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}
                >
                  {CapitalizeFirstName(item.category)}
                </Text>
              </View>
              <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
                {"•"}
              </Text>
              <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
                {item.id.slice(0, 6)}
              </Text>
            </View>
            <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
              {item.notes ? item.notes : "No notes"}
            </Text>
          </View>
        </View>

        <View style={[styles.gapRow]}>
          <Pressable
            hitSlop={20}
            style={styles.actionBtn}
            onPress={() => {
              router.push({
                pathname: "/protected/inventory/[id]",
                params: {
                  id: item.id,
                },
              });
            }}
          >
            <Eye size={scale(15)} color={"rgba(74, 85, 101, 1)"} />
          </Pressable>
          <Pressable
            hitSlop={20}
            style={styles.actionBtn}
            onPress={handleDelete}
          >
            <Trash2 size={scale(15)} color={"rgba(231, 0, 11, 1)"} />
          </Pressable>
        </View>
      </View>

      <View style={styles.row}>
        <View
          style={[
            styles.col,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
            Quantity
          </Text>

          <Text style={[Styles.reg14, { color: Colors.text.black }]}>
            {item.quantity} {item.unit}
          </Text>
        </View>

        <View
          style={[
            styles.col,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
            Price per Unit
          </Text>

          <Text style={[Styles.reg14, { color: Colors.text.black }]}>
            {FormatCurrency(item.sellingPricePerUnit ?? 1)}
          </Text>
        </View>

        <View
          style={[
            styles.col,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
            Alert
          </Text>

          <View
            style={[
              styles.badgeView,
              {
                backgroundColor: outOfStock
                  ? "rgba(255, 226, 226, 1)"
                  : bgColor,
              },
            ]}
          >
            <Text
              style={[
                Styles.reg12,
                { color: outOfStock ? "rgba(193, 0, 7, 1)" : textColor },
              ]}
            >
              {alert}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.box}>
        <View style={styles.row}>
          <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
            Stock Value
          </Text>
          <Text
            style={[Styles.med16, { color: Colors.primary, lineHeight: 24 }]}
          >
            {FormatCurrency(item.quantity * (item.sellingPricePerUnit ?? 1))}
          </Text>
        </View>

        <View style={styles.row}>
          <Text
            style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}
            numberOfLines={1}
          >
            Supplier: {item.supplier}
          </Text>
          <Text
            style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}
            numberOfLines={1}
          >
            Min: {item.minStockLevel} {item.unit}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default StockItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(253, 254, 254, 1)",
    padding: spacing(16),
    gap: spacing(12),
    borderWidth: 0.3,
    borderRadius: 16,
    borderColor: "rgba(74, 85, 101, 1)",
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
  gapRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing(40),
  },
  iconWrapper: {
    width: 48,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  typeView: {
    backgroundColor: "rgba(229, 231, 235, 1)",
    paddingHorizontal: spacing(7),
    paddingVertical: spacing(2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  actionBtn: {
    width: 32,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  col: {
    gap: spacing(4),
  },
  badgeView: {
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(4),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  box: {
    backgroundColor: "rgba(232, 245, 244, 1)",
    padding: spacing(12),
    gap: spacing(8),
    borderRadius: 14,
  },
});
