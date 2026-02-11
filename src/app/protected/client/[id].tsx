import ClientCard from "@/src/components/clients/clientCard";
import AddMeasurements from "@/src/components/clients/modal/EditMeasurement";
import EditNote from "@/src/components/clients/modal/EditNote";
import DesignItem from "@/src/components/designs/DesignItem";
import { HapticTab } from "@/src/components/haptic-tab";
import InvoiceItem from "@/src/components/invoice/Item";
import OrderItem from "@/src/components/orders/OrderItem";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { getCurrentUserEmail } from "@/src/lib/auth-utils";
import { useClientStore } from "@/src/stores/clientSlice";
import { useDesignStore } from "@/src/stores/designSlice";
import { useInvoiceStore } from "@/src/stores/invoiceSlice";
import { useOrderStore } from "@/src/stores/orderSlice";
import { Client } from "@/src/types/client";
import {
  CapitalizeFirstName,
  FormatCurrency,
  FormatMeasurementsForUI,
  FormatNairaShorthand,
  FormatOrderDate,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import {
  Box,
  Calendar,
  ChevronLeft,
  FileText,
  Pencil,
  Plus,
  Ruler,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
const BOXWIDTH = SCREEN_WIDTH / 3.5 - 10;

type TabProps = {
  client: Client | undefined;
};

const OverViewTab = ({ client }: TabProps) => {
  const invoices = useInvoiceStore((state) => state.invoices);
  const clientInvoices = invoices.filter(
    (prev) => prev.clientEmail === client?.email,
  );
  // console.log("client invoice", JSON.stringify(clientInvoices, null, 2));
  const [editNoteModal, setEditNoteModal] = useState(false);
  const toggleEditNoteModal = () => setEditNoteModal((prev) => !prev);

  const orders = useOrderStore((state) => state.orders);
  const clientsOrder = orders.filter(
    (prev) => (prev.clientId || prev.clientPhone) === client?.id,
  );
  const totalSpent = clientsOrder.reduce(
    (acc, ord) => acc + (Number(ord?.price) || 0),
    0,
  );
  const orderCount = clientsOrder.length;

  return (
    <>
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
            <Text style={[styles.reg18]}>{clientInvoices.length}</Text>
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

        <View style={[styles.col]}>
          <View style={styles.row}>
            <View style={[styles.gapRow, { gap: spacing(12) }]}>
              <FileText size={scale(18)} color={Colors.primary} />
              <Text style={[styles.reg18, { fontSize: scaleFontSize(15) }]}>
                Notes
              </Text>
            </View>
            <HapticTab hitSlop={20} onPress={toggleEditNoteModal}>
              <Pencil size={scale(18)} color={"black"} />
            </HapticTab>
          </View>

          <Text style={[styles.reg14g, { flexShrink: 1 }]}>
            {client?.notes ? client.notes : "Add note"}
          </Text>
        </View>

        <View style={[styles.col, { gap: spacing(12) }]}>
          <Text style={[Styles.reg16, { color: Colors.text.black }]}>
            Recent Activity
          </Text>
          <View style={styles.orders}>
            {clientsOrder.map((order, index) => (
              <OrderItem order={order} key={index} />
            ))}
            {/* {
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
                      <Text
                        style={[Styles.reg14, { color: Colors.text.black }]}
                      >
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
            } */}
          </View>
        </View>
      </View>
      {editNoteModal && client && (
        <EditNote
          visible={editNoteModal}
          onClose={toggleEditNoteModal}
          client={client}
        />
      )}
    </>
  );
};

const MeasurementsTab = ({ client }: TabProps) => {
  const measurementList = FormatMeasurementsForUI(client?.measurements);

  const [addMeasurements, setAddMeasurements] = useState(false);
  const toggleModal = () => setAddMeasurements((prev) => !prev);

  return (
    <>
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

          <HapticTab
            style={[
              styles.iconWrapper,
              { backgroundColor: Colors.primary, borderRadius: 100 },
            ]}
            onPress={toggleModal}
          >
            <Plus size={scale(18)} color={"white"} strokeWidth={2} />
          </HapticTab>
        </View>

        <View style={styles.measurements}>
          {measurementList.map((detail, index) => (
            <View style={styles.box} key={index}>
              <View style={styles.row}>
                <Text style={[Styles.reg12, { color: Colors.grayText }]}>
                  {detail.label}
                </Text>
                <Ruler
                  size={scale(15)}
                  color={Colors.primary}
                  strokeWidth={1}
                />
              </View>

              <Text style={[styles.med18]}>{detail.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {addMeasurements && client && (
        <AddMeasurements
          visible={addMeasurements}
          onClose={toggleModal}
          client={client}
        />
      )}
    </>
  );
};

const DesignsTab = ({ client }: TabProps) => {
  const designs = useDesignStore((state) => state.designs);
  const clientDesigns = designs.filter((prev) => prev.clientId === client?.id);

  return (
    <View style={[styles.tabContainer, { paddingTop: 20 }]}>
      <View style={styles.row}>
        <Text style={styles.reg16}>{clientDesigns.length} Designs</Text>
        <HapticTab
          style={styles.rowBtn}
          onPress={() => {
            router.push({
              pathname: "/protected/form/create-design",
              params: { clientId: client?.id ?? "" },
            });
          }}
        >
          <Plus size={scale(15)} color={"white"} />
          <Text style={[styles.reg14g, { color: "white" }]}>New Design</Text>
        </HapticTab>
      </View>

      <View style={styles.designs}>
        {clientDesigns.map((design, index) => (
          <DesignItem item={design} key={index} />
        ))}
      </View>
    </View>
  );
};

const OrdersTab = ({ client }: TabProps) => {
  const orders = useOrderStore((state) => state.orders);
  const clientsOrder = orders.filter(
    (prev) => (prev.clientId || prev.clientPhone) === client?.id,
  );
  return (
    <View style={styles.tabContainer}>
      <View style={styles.row}>
        <Text style={styles.reg16}>{clientsOrder.length} Total Orders</Text>
        <HapticTab
          style={styles.rowBtn}
          onPress={() => {
            router.push({
              pathname: "/protected/form/create-order",
              params: { clientId: client?.id ?? "" },
            });
          }}
        >
          <Plus size={scale(15)} color={"white"} />
          <Text style={[styles.reg14g, { color: "white" }]}>New Order</Text>
        </HapticTab>
      </View>

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

                <View style={[styles.badgeView, { backgroundColor: bgColor }]}>
                  <Text
                    style={[Styles.reg12, { lineHeight: 16, color: textColor }]}
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
  );
};

const InvoicesTab = ({ client }: TabProps) => {
  const invoices = useInvoiceStore((state) => state.invoices);
  const clientInvoices = invoices.filter(
    (prev) => prev.clientEmail === client?.email,
  );
  const totalInvoiceAmount = clientInvoices.reduce((grandTotal, invoice) => {
    const invoiceTotal = invoice.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    return grandTotal + invoiceTotal;
  }, 0);

  return (
    <View style={[styles.tabContainer, { paddingTop: 20 }]}>
      <View style={styles.recBox}>
        <View style={styles.row}>
          <Text style={[styles.reg14g, { color: Colors.text.black }]}>
            Total Invoiced
          </Text>
          <Text style={[styles.reg20, { color: Colors.primary }]}>
            {FormatCurrency(totalInvoiceAmount)}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.reg16}>{clientInvoices.length} Invoices</Text>
        <HapticTab
          style={styles.rowBtn}
          onPress={() =>
            router.push({
              pathname: "/protected/form/create-invoice",
              params: { clientId: client?.id ?? "" },
            })
          }
        >
          <Plus size={scale(15)} color={"white"} />
          <Text style={[styles.reg14g, { color: "white" }]}>New Invoice</Text>
        </HapticTab>
      </View>

      <View style={styles.invoices}>
        {clientInvoices.map((invoice, index) => (
          <InvoiceItem invoice={invoice} key={index} />
        ))}
      </View>
    </View>
  );
};

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
  {
    label: "Design",
    value: "design",
  },
  {
    label: "Orders",
    value: "order",
  },
  {
    label: "Invoices",
    value: "invoice",
  },
];

const ClientDetailsScreen = () => {
  const { id } = useLocalSearchParams();

  const clientId = encodeURIComponent(id.toString());

  const clients = useClientStore((state) => state.clients);
  const client = clients.find((prev) => prev.id === clientId);

  const fetchInvoices = useInvoiceStore((state) => state.getInvoicesByTailor);

  // console.log("client", JSON.stringify(clients, null, 2));

  const [selectedTab, setSelectedTab] = useState<TAB>("index");

  const TabHandler = {
    index: <OverViewTab client={client} />,
    measurements: <MeasurementsTab client={client} />,
    design: <DesignsTab client={client} />,
    order: <OrdersTab client={client} />,
    invoice: <InvoicesTab client={client} />,
  };

  useEffect(() => {
    fetchInvoices(getCurrentUserEmail());
  }, []);

  const handleBack = () => {
    router.replace("/(tabs)/Clients");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container}>
        <View style={styles.rowHeader}>
          <Pressable hitSlop={20} onPress={handleBack}>
            <ChevronLeft size={scale(20)} color={"black"} />
          </Pressable>
          <HapticTab
            style={styles.gapRow}
            onPress={() => {
              router.push({
                pathname: "/protected/clientAppt/[phone]",
                params: {
                  phone: client?.phone ?? "",
                },
              });
            }}
          >
            <Calendar size={scale(18)} color={"black"} />
            <Text
              style={[
                Styles.reg14,
                { lineHeight: 20, color: Colors.text.gray },
              ]}
            >
              Appt.
            </Text>
          </HapticTab>
        </View>

        <View style={styles.content}>
          <ClientCard item={client} />

          {/* tabs */}
          <ScrollView
            horizontal
            style={{ maxHeight: 40 }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
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
                  style={[buttonStyle]}
                  onPress={() => setSelectedTab(tab.value as TAB)}
                >
                  <Text style={[textStyle, { textAlign: "center" }]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

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
  recBox: {
    backgroundColor: "#E8F5F4",
    padding: spacing(16),
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing(15),
    gap: spacing(8),
    height: 36,
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
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabBtn: {
    width: BOXWIDTH,
    height: 40,
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
  reg16: {
    fontFamily: "regular",
    fontSize: scaleFontSize(16),
    color: Colors.text.black,
  },
  reg20: {
    fontFamily: "regular",
    fontSize: scaleFontSize(20),
    color: Colors.text.black,
  },
  reg14g: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: Colors.text.gray,
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
  invoices: {
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
  designs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 15,
  },
});
