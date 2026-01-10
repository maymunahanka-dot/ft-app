import ClientCard from "@/src/components/clients/clientCard";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useClientStore } from "@/src/stores/clientSlice";
import { useOrderStore } from "@/src/stores/orderSlice";
import { Client } from "@/src/types/client";
import {
  CapitalizeFirstName,
  FormatMeasurementsForUI,
  FormatNairaShorthand,
  FormatOrderDate,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import { Box, Calendar, ChevronLeft, Plus, Ruler } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BOXWIDTH = SCREEN_WIDTH / 4 - 10;

type TabProps = {
  client: Client | undefined;
};

const OverViewTab = ({ client }: TabProps) => {
  const orders = useOrderStore((state) => state.orders);
  const clientsOrder = orders.filter(
    (prev) => (prev.clientId || prev.clientPhone) === client?.id
  );
  const totalSpent = clientsOrder.reduce(
    (acc, ord) => acc + (Number(ord?.price) || 0),
    0
  );
  const orderCount = clientsOrder.length;

  return (
    <View style={styles.tabContainer}>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.reg18]}>{orderCount}</Text>
          <Text
            style={[
              Styles.reg12,
              { color: "rgba(74, 85, 101, 1)", lineHeight: 16 },
            ]}
          >
            Total Orders
          </Text>
        </View>

        <View style={styles.col}>
          <Text style={[styles.reg18]}>
            {FormatNairaShorthand(totalSpent.toString())}
          </Text>
          <Text
            style={[
              Styles.reg12,
              { color: "rgba(74, 85, 101, 1)", lineHeight: 16 },
            ]}
          >
            Total Spent
          </Text>
        </View>

        <View style={styles.col}>
          <Text style={[styles.reg18]}>{2}</Text>
          <Text
            style={[
              Styles.reg12,
              { color: "rgba(74, 85, 101, 1)", lineHeight: 16 },
            ]}
          >
            Invoices
          </Text>
        </View>
      </View>

      <View style={[styles.col, { gap: spacing(12) }]}>
        <Text style={[Styles.reg16, { color: Colors.text.black }]}>
          Recent Activity
        </Text>
        <View style={styles.orders}>
          {clientsOrder.map((order, index) => {
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
              <View style={styles.orderCard} key={index}>
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

                <View
                  style={[
                    styles.col,
                    { gap: spacing(4), alignItems: "flex-end" },
                  ]}
                >
                  <Text style={[Styles.reg14, { color: Colors.text.black }]}>
                    {FormatNairaShorthand(order.price.toString())}
                  </Text>

                  <View
                    style={[styles.badgeView, { backgroundColor: bgColor }]}
                  >
                    <Text
                      style={[
                        Styles.reg12,
                        { lineHeight: 16, color: textColor },
                      ]}
                    >
                      {CapitalizeFirstName(order.status)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const MeasurementsTab = ({ client }: TabProps) => {
  const measurementList = FormatMeasurementsForUI(client?.measurements);

  return (
    <View style={styles.tabContainer}>
      <View style={styles.rowHeader}>
        <View style={[styles.col, { gap: spacing(2) }]}>
          <Text style={[Styles.reg16, { color: Colors.text.black }]}>
            Body Measurements
          </Text>
          <Text style={[Styles.reg12, { color: Colors.text.gray }]}>
            Standard measurements in inches
          </Text>
        </View>

        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: Colors.primary, borderRadius: 100 },
          ]}
        >
          <Plus size={scale(18)} color={"white"} strokeWidth={2} />
        </View>
      </View>

      <View style={styles.measurements}>
        {measurementList.map((detail, index) => (
          <View style={styles.box} key={index}>
            <View style={styles.row}>
              <Text style={[Styles.reg12, { color: Colors.grayText }]}>
                {detail.label}
              </Text>
              <Ruler size={scale(15)} color={Colors.primary} strokeWidth={1} />
            </View>

            <Text style={[styles.med18]}>{detail.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// const DesignsTab = ({ client }: TabProps) => {
//   return <View style={styles.tabContainer}></View>;
// };

// const OrdersTab = ({ client }: TabProps) => {
//   return <View style={styles.tabContainer}></View>;
// };

type TAB = "index" | "measurements";
// | "design";
// | "order";

const TABLIST = [
  {
    label: "Overview",
    value: "index",
  },
  {
    label: "Measurements",
    value: "measurements",
  },
  // {
  //   label: "Design",
  //   value: "design",
  // },
  // {
  //   label: "Orders",
  //   value: "order",
  // },
];

const ClientDetailsScreen = () => {
  const { id } = useLocalSearchParams();

  const clientId = id.toString();

  const clients = useClientStore((state) => state.clients);
  const client = clients.find((prev) => prev.id === clientId);

  const [selectedTab, setSelectedTab] = useState<TAB>("index");

  const TabHandler = {
    index: <OverViewTab client={client} />,
    measurements: <MeasurementsTab client={client} />,
    // design: <DesignsTab client={client} />,
    // order: <OrdersTab client={client} />,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container}>
        <View style={styles.rowHeader}>
          <Pressable hitSlop={20} onPress={() => router.back()}>
            <ChevronLeft size={scale(20)} color={"black"} />
          </Pressable>
          <View style={styles.gapRow}>
            <Calendar size={scale(18)} color={"black"} />
            <Text
              style={[
                Styles.reg14,
                { lineHeight: 20, color: Colors.text.gray },
              ]}
            >
              Appt.
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <ClientCard item={client} />

          {/* tabs */}
          <View style={styles.tabs}>
            {TABLIST.map((tab, index) => {
              const isSelected = selectedTab === tab.value;
              const textStyle = isSelected
                ? [Styles.reg12, styles.selectedText]
                : [Styles.reg12, { color: Colors.grey }];
              const buttonStyle = isSelected
                ? [styles.tabBtn, styles.selectedTab]
                : [styles.tabBtn];
              return (
                <Pressable
                  key={index}
                  style={[buttonStyle, { width: BOXWIDTH, height: 40 }]}
                  onPress={() => setSelectedTab(tab.value as TAB)}
                >
                  <Text style={[textStyle, { textAlign: "center" }]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* tab content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: spacing(30),
            }}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            keyboardDismissMode="interactive"
          >
            {TabHandler[selectedTab]}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ClientDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing(20),
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    paddingVertical: spacing(24),
    gap: spacing(24),
  },
  tabContainer: {
    paddingTop: spacing(24),
    gap: spacing(30),
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
  col: {
    gap: spacing(16),
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gapRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing(8),
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabBtn: {
    flex: 1,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(249, 250, 251, 1)",
    backgroundColor: "white",
  },
  selectedTab: {
    backgroundColor: Colors.primary,
  },
  selectedText: {
    color: "white",
  },
  reg18: {
    fontFamily: "regular",
    fontSize: scaleFontSize(18),
    lineHeight: 16,
    color: Colors.text.black,
    textAlign: "center",
  },
  med18: {
    fontFamily: "medium",
    fontSize: scaleFontSize(18),
    lineHeight: 24,
    color: Colors.text.black,
  },
  orders: {
    gap: spacing(12),
  },
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
  measurements: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing(16),
    flexWrap: "wrap",
  },
  box: {
    width: "45%",
    height: 88,
    padding: spacing(16),
    backgroundColor: "rgba(249, 250, 251, 1)",
    gap: spacing(8),
    borderRadius: 16,
  },
  badgeView: {
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(8),
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
