import { HapticTab } from "@/src/components/haptic-tab";
import SelectFilterModal from "@/src/components/shared/modal/SelectFilterModal";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useClientStore } from "@/src/stores/clientSlice";
import { useOrderStore } from "@/src/stores/orderSlice";
import { OrderStatus } from "@/src/types/Order";
import {
  CapitalizeFirstName,
  FormatCurrency,
  FormatMeasurementsForUI,
  GetInitials,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import {
  Check,
  ChevronLeft,
  Dot,
  Package,
  Phone,
  Ruler,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const callPhoneNumber = async (phoneNumber: string) => {
  if (!phoneNumber) {
    Alert.alert("Error", "Phone number not available");
    return;
  }

  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, "");

  const phoneUrl = `tel:${cleanedNumber}`;

  const supported = await Linking.canOpenURL(phoneUrl);

  if (!supported) {
    Alert.alert("Error", "Calling is not supported on this device");
    return;
  }

  await Linking.openURL(phoneUrl);
};

const orderStatusList = [
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Confirmed",
    value: "confirmed",
  },
  {
    label: "In Progress",
    value: "in-progress",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Delivered",
    value: "delivered",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];

type StandProps = {
  active: boolean;
  title: string;
};

const StatusStand = ({ active, title }: StandProps) => {
  const iconColor = active ? "#00A63E" : "#99A1AF";
  const bgColor = active ? "#DCFCE7" : "#E5E7EB";
  const stickColor = active ? "#B9F8CF" : "#D1D5DC";

  return (
    <View style={[styles.gapRow, { alignItems: "flex-start" }]}>
      <View style={styles.stand}>
        <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
          {active ? (
            <Check size={scale(12)} color={iconColor} />
          ) : (
            <Dot size={scale(18)} color={iconColor} />
          )}
        </View>
        <View style={[styles.stick, { backgroundColor: stickColor }]} />
      </View>
      <Text style={[styles.reg14, { color: "#4A5565" }]}>{title}</Text>
    </View>
  );
};

const OrderDetailScreen = () => {
  const { id } = useLocalSearchParams();

  const orderId = id.toString();

  const loading = useOrderStore((state) => state.loading);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const orders = useOrderStore((state) => state.orders);
  const order = orders.find((prev) => prev.id === orderId)!;

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

  const [statusModal, setStatusModal] = useState(false);
  const toggleStatusModal = () => setStatusModal((prev) => !prev);

  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.status);

  const clients = useClientStore((state) => state.clients);
  const foundClient = clients.find(
    (prev) => prev.id === order.clientId?.toString(),
  );

  const measurementList = FormatMeasurementsForUI(
    order.measurements &&
      typeof order.measurements === "object" &&
      "neck" in order.measurements
      ? (order.measurements as any)
      : foundClient?.measurements,
  );

  const ORDER_FLOW: OrderStatus[] = [
    "pending",
    "confirmed",
    "in-progress",
    "completed",
    "delivered",
  ];

  const getStatusIndex = (status: OrderStatus) => ORDER_FLOW.indexOf(status);

  const currentStatusIndex = getStatusIndex(orderStatus);

  const handleOrderUpdate = async () => {
    if (order.status === orderStatus) {
      router.back();
      return;
    }
    try {
      await updateOrderStatus(order.id, orderStatus);
      router.back();
    } catch (error) {
      console.error("error handling order update", error);
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
            onPress={() => router.back()}
          >
            <ChevronLeft
              size={scale(20)}
              color={"rgba(54, 65, 83, 1)"}
              strokeWidth={1.5}
            />
          </HapticTab>

          <Text style={styles.reg24}>Order Details</Text>
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
            <Text style={styles.reg14}>#{order?.id.slice(0, 10)}</Text>
            <View
              style={[
                styles.badgeView,
                {
                  backgroundColor: bgColor,
                  borderWidth: 1,
                  borderColor: textColor,
                },
              ]}
            >
              <Text style={[Styles.reg16, { color: textColor }]}>
                {CapitalizeFirstName(order.status)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.reg14}>Client Information</Text>
              <View style={styles.box}>
                <View style={[styles.gapRow]}>
                  <View style={styles.bgView}>
                    <Text style={[styles.reg16, { color: "white" }]}>
                      {GetInitials(order.clientName)}
                    </Text>
                  </View>

                  <Text style={styles.reg14}>
                    {CapitalizeFirstName(order.clientName)}
                  </Text>
                </View>

                <View style={styles.gapRow}>
                  <Phone size={scale(18)} color={Colors.primary} />
                  <Text style={styles.reg14}>{order.clientPhone}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.reg14}>Order Details</Text>
                <View style={styles.box}>
                  <View style={[styles.gapRow, { alignItems: "flex-start" }]}>
                    <Package
                      size={scale(20)}
                      color={Colors.primary}
                      height={30}
                    />
                    <View style={[styles.col, { gap: spacing(4) }]}>
                      <Text style={[styles.reg14, { color: Colors.text.gray }]}>
                        Item
                      </Text>
                      <Text style={styles.reg14}>
                        {order.garmentDescription}
                      </Text>
                      <Text
                        style={[
                          styles.reg14,
                          {
                            fontSize: scaleFontSize(12),
                            color: Colors.text.gray,
                          },
                        ]}
                      >
                        {order.garmentType}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.gapRow, { alignItems: "flex-start" }]}>
                    <Ruler
                      size={scale(20)}
                      color={Colors.primary}
                      height={30}
                    />
                    <View style={[styles.col, { gap: spacing(4) }]}>
                      <Text style={[styles.reg14, { color: Colors.text.gray }]}>
                        Fabric
                      </Text>
                      <Text style={styles.reg14}>
                        {order.fabric ? order.fabric : "Not Specified"}
                      </Text>
                      <Text
                        style={[
                          styles.reg14,
                          {
                            fontSize: scaleFontSize(12),
                            color: Colors.text.gray,
                          },
                        ]}
                      >
                        {order.quantity} pc{order.quantity > 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.reg14}>Measurements</Text>
              <View style={styles.measurements}>
                {measurementList.map((measure, index) => (
                  <View style={styles.measure} key={index}>
                    <Text
                      style={[
                        styles.reg14,
                        {
                          fontSize: scaleFontSize(12),
                          color: Colors.text.gray,
                        },
                      ]}
                    >
                      {measure.label}
                    </Text>
                    <Text style={styles.reg14}>{measure.value}&quot;</Text>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.reg14}>Pricing</Text>
                <View
                  style={[
                    styles.box,
                    {
                      backgroundColor: "#FFFBEB",
                      borderWidth: 1,
                      borderColor: "#FEE685",
                      borderRadius: 16,
                    },
                  ]}
                >
                  <View style={[styles.row]}>
                    <Text style={[Styles.reg14, { color: Colors.text.black }]}>
                      Total Amount
                    </Text>
                    <Text style={[Styles.reg16, { color: Colors.text.black }]}>
                      {FormatCurrency(order.price)}
                    </Text>
                  </View>
                  <View style={[styles.row]}>
                    <Text style={[Styles.reg14, { color: "#008236" }]}>
                      Deposit Paid
                    </Text>
                    <Text style={[Styles.reg16, { color: Colors.text.black }]}>
                      {FormatCurrency(order.deposit)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.row,
                      {
                        borderTopWidth: 1,
                        borderTopColor: "#FFD230",
                        paddingTop: spacing(12),
                      },
                    ]}
                  >
                    <Text style={[Styles.reg14, { color: "#973C00" }]}>
                      Balance Due
                    </Text>
                    <Text style={[Styles.reg16, { color: Colors.text.black }]}>
                      {FormatCurrency(order.balance)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.reg14}>Order Timeline</Text>
                <Pressable hitSlop={20} onPress={toggleStatusModal}>
                  <Text style={[styles.reg14, { color: "#0D6B62" }]}>
                    Update timeline
                  </Text>
                </Pressable>
              </View>
              <View style={styles.box}>
                <View style={styles.statusStands}>
                  {order.status === "cancelled" ? (
                    <View style={styles.statusStands}>
                      <StatusStand title="Order Cancelled" active />
                    </View>
                  ) : (
                    ORDER_FLOW.map((status, index) => (
                      <StatusStand
                        key={status}
                        title={CapitalizeFirstName(status.replace("-", " "))}
                        active={index <= currentStatusIndex}
                      />
                    ))
                  )}
                </View>
              </View>
            </View>

            <View style={[styles.row, { gap: spacing(30) }]}>
              <Pressable
                onPress={() => callPhoneNumber(order.clientPhone)}
                style={styles.rowBtn}
              >
                <Phone size={scale(18)} color={Colors.black} />
                <Text style={styles.reg16}>Contact</Text>
              </Pressable>

              <Pressable
                onPress={handleOrderUpdate}
                style={[styles.rowBtn, { backgroundColor: Colors.primary }]}
              >
                {loading ? (
                  <ActivityIndicator size={"small"} color={"white"} />
                ) : (
                  <Text style={[styles.reg16, { color: "white" }]}>
                    Send timeline Update
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      {statusModal && (
        <SelectFilterModal
          data={orderStatusList}
          visible={statusModal}
          handleOption={(option) => setOrderStatus(option as OrderStatus)}
          selected={orderStatus}
          onClose={() => setStatusModal(false)}
        />
      )}
    </>
  );
};

export default OrderDetailScreen;

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
  reg14: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: Colors.text.black,
  },
  reg16: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
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
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  badgeView: {
    height: 50,
    paddingHorizontal: spacing(20),
    borderRadius: 14,
    justifyContent: "center",
    // alignItems: "center",
  },
  bgView: {
    width: 48,
    aspectRatio: 1,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  section: {
    gap: spacing(12),
  },
  box: {
    backgroundColor: "#F9FAFB",
    padding: spacing(16),
    gap: spacing(12),
    borderRadius: 16,
  },
  measurements: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing(12),
  },
  measure: {
    width: `${90 / 3}%`,
    gap: spacing(5),
    justifyContent: "center",
    alignItems: "center",
  },
  stand: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  iconWrapper: {
    width: 32,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  stick: {
    width: 2,
    height: 32,
  },
  statusStands: {
    gap: spacing(15),
  },
  rowBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing(7),
    borderRadius: 14,
  },
});
