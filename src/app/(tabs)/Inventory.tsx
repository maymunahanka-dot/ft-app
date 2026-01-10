import GlassCard from "@/src/components/dashboard/boxes/GlassBox";
import { HapticTab } from "@/src/components/haptic-tab";
import BGScreenBG from "@/src/components/shared/BGScreenBG";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useInventoryStore } from "@/src/stores/inventorySlice";
import { useUserStore } from "@/src/stores/userSlice";
import { GetTotalInventoryValue } from "@/src/types/inventory";
import {
  FormatNairaShorthand,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import {
  BanknoteArrowUp,
  Plus,
  Search,
  TrendingDown,
  TriangleAlert,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BOXWIDTH = SCREEN_WIDTH / 3 - 16;

const RowBoxes = () => {
  const user = useUserStore((state) => state.user);
  const stocks = useInventoryStore((state) => state.stocks);
  const fetchStocks = useInventoryStore((state) => state.getInventoryByTailor);

  const lowStock = stocks.map((prev) => prev.status === "low-stock").length;
  const outOfStock = stocks.map(
    (prev) => prev.status === "out-of-stock"
  ).length;
  const inventoryValue = GetTotalInventoryValue(stocks);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      await Promise.all([fetchStocks(user.email)]);
    } catch (error) {
      console.error("error fetching data", error);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.row}>
      <GlassCard style={styles.box}>
        <View style={[styles.startRow, { paddingBottom: spacing(12) }]}>
          <BanknoteArrowUp size={scale(15)} color={"white"} />
          <Text style={[Styles.med12, { color: "white", lineHeight: 16 }]}>
            Stock Value
          </Text>
        </View>

        <Text style={styles.sm18}>
          {FormatNairaShorthand(inventoryValue.toString())}
        </Text>
      </GlassCard>

      <GlassCard style={styles.box}>
        <View style={[styles.startRow, { paddingBottom: spacing(12) }]}>
          <TriangleAlert size={scale(15)} color={"white"} />
          <Text style={[Styles.med12, { color: "white", lineHeight: 16 }]}>
            Low Stock
          </Text>
        </View>

        <Text style={styles.sm18}>{lowStock}</Text>
      </GlassCard>

      <GlassCard style={styles.box}>
        <View style={[styles.startRow, { paddingBottom: spacing(12) }]}>
          <TrendingDown size={scale(15)} color={"white"} />
          <Text style={[Styles.med12, { color: "white", lineHeight: 16 }]}>
            Out of Stock
          </Text>
        </View>

        <Text style={styles.sm18}>{outOfStock}</Text>
      </GlassCard>
    </View>
  );
};

const InventoryScreen = () => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["bottom"]}
    >
      <BGScreenBG
        title="Inventory"
        subText
        text="Manage your stock and supplies"
        rightIcon={() => (
          <HapticTab style={styles.plusBtn}>
            <Plus size={24} color={Colors.primary} />
          </HapticTab>
        )}
        headerChildren={RowBoxes}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, gap: spacing(32) }}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          //   scrollEnabled={false}
        >
          <View style={styles.content}>
            <View
              style={[
                styles.searchContainer,
                styles.startRow,
                { gap: spacing(12) },
              ]}
            >
              <Search
                size={scale(20)}
                color={"rgba(153, 161, 175, 1)"}
                strokeWidth={2}
              />
              <TextInput
                value={searchValue}
                onChangeText={setSearchValue}
                placeholder={"Search inventory..."}
                placeholderTextColor={Colors.grey}
                style={styles.input}
              />
            </View>
          </View>
        </ScrollView>
      </BGScreenBG>
    </SafeAreaView>
  );
};

export default InventoryScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing(15),
  },
  plusBtn: {
    width: 48,
    aspectRatio: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: BOXWIDTH,
    height: 110,
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(4),
  },
  sm18: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(20),
    lineHeight: 28,
    color: "white",
    textAlign: "center",
  },
  searchContainer: {
    backgroundColor: "rgba(249, 250, 251, 1)",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 1)",
    borderRadius: 14,
    paddingVertical: spacing(12),
    paddingHorizontal: spacing(16),
  },
  input: {
    flex: 1,
  },
});
