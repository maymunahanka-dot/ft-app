import PrimaryButton from "@/src/components/button/PrimaryButton";
import SelectClientModal from "@/src/components/form/order/SelectClientModal";
import { HapticTab } from "@/src/components/haptic-tab";
import SelectFilterModal from "@/src/components/shared/modal/SelectFilterModal";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { getCurrentUserEmail } from "@/src/lib/auth-utils";
import { GenerateOrderId } from "@/src/lib/order";
import { useClientStore } from "@/src/stores/clientSlice";
import { EntryMoney } from "@/src/components/shared/MoneyAmount";
import { useDisplayCurrency } from "@/src/hooks/useDisplayCurrency";
import { useOrderStore } from "@/src/stores/orderSlice";
import { Client } from "@/src/types/client";
import { Order } from "@/src/types/Order";
import {
  CapitalizeFirstName,
  extractClientMeasurements,
  FormatDateToYYYYMMDD,
  GetDetailedDate,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Calendar, ChevronDown, ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";

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

const orderGarmentTypeList = [
  {
    label: "Shirt",
    value: "shirt",
  },
  {
    label: "Trouser",
    value: "trouser",
  },
  {
    label: "Suit",
    value: "suit",
  },
  {
    label: "Blouse",
    value: "blouse",
  },
  {
    label: "Skirt",
    value: "skirt",
  },
  {
    label: "Jacket",
    value: "jacket",
  },
  {
    label: "Traditional",
    value: "traditional",
  },
  {
    label: "Other",
    value: "other",
  },
];

const CreateOrderScreen = () => {
  const { t: tx } = useTranslation();
  const { clientId } = useLocalSearchParams<{ clientId?: string }>();
  const clients = useClientStore((state) => state.clients);
  const foundClient = clients.find((prev) => prev.id === clientId?.toString());

  const createOrder = useOrderStore((state) => state.saveOrder);
  const { symbol, toNaira, blockUntilRate } = useDisplayCurrency();
  const loading = useOrderStore((state) => state.loading);

  const { isDark } = useTheme();
  const { top } = useSafeAreaInsets();

  const bg = isDark ? "#0f0f0f" : "white";
  const textColor = isDark ? Colors.text.white : "rgba(54, 65, 83, 1)";
  const labelColor = isDark ? "rgba(160,160,160,1)" : "#4A5565";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "white";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : Colors.inputBorder;
  const inputTextColor = isDark ? Colors.text.white : Colors.black;
  const placeholderColor = isDark ? "rgba(100,100,100,1)" : Colors.grayText;
  const dropdownTextColor = isDark ? "rgba(200,200,200,1)" : "rgba(10, 10, 10, 0.5)";
  const dropdownActiveColor = isDark ? Colors.text.white : "rgba(10, 10, 10, 1)";
  const chevronColor = isDark ? "rgba(160,160,160,1)" : Colors.grey;
  const detailBoxBg = isDark ? "rgba(13,40,80,0.5)" : "rgba(239, 246, 255, 1)";
  const detailBoxBorder = isDark ? "rgba(30,80,160,0.4)" : "rgba(190, 219, 255, 1)";
  const summaryBoxBg = isDark ? "rgba(80,60,0,0.3)" : "rgba(254, 230, 133, 0.3)";
  const summaryBoxBorder = isDark ? "rgba(120,90,0,0.3)" : "rgba(254, 230, 133, 0.3)";
  const summaryTitleColor = isDark ? "rgba(255,190,80,1)" : "rgba(123, 51, 6, 1)";

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientModal, setClientModal] = useState(false);
  const toggleClientModal = () => setClientModal((prev) => !prev);

  const [statusModal, setStatusModal] = useState(false);
  const toggleStatusModal = () => setStatusModal((prev) => !prev);

  const [typeModal, setTypeModal] = useState(false);
  const toggleTypeModal = () => setTypeModal((prev) => !prev);

  const [showPicker, setShowPicker] = useState(false);

  const [orderData, setOrderData] = useState<Order>({
    id: GenerateOrderId(),
    clientName: "",
    clientPhone: "",
    clientId: "",
    orderDate: "",
    status: "in-progress",
    specialInstructions: "",
    garmentDescription: "",
    garmentType: "blouse",
    deposit: 0,
    price: 0,
    color: "",
    quantity: 1,
    fabric: "",
    dueDate: "",
    measurements: {
      chest: "",
      hips: "",
      length: "",
      notes: "",
      shoulder: "",
      sleeveLength: "",
      waist: "",
      blouseLength: "",
      shirtLength: "",
      skirtLength: "",
      trouserLength: "",
    },
    balance: 0,
    paymentStatus: "unpaid",
    tailorId: getCurrentUserEmail(),
    userEmail: getCurrentUserEmail(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [error, setError] = useState({
    clientName: "",
    clientPhone: "",
    orderDate: "",
    status: "",
    garmentDescription: "",
    garmentType: "",
    deposit: "",
    price: "",
    quantity: "",
    dueDate: "",
    balance: "",
  });

  const handleDataChange = (
    field: keyof typeof orderData,
    value: string | number,
  ) => {
    setOrderData({ ...orderData, [field]: value });
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleMeasurementUpdate = (
    field: keyof Order["measurements"],
    value: string,
  ) => {
    setOrderData({
      ...orderData,
      measurements: {
        ...orderData.measurements,
        [field]: value,
      },
    });
  };

  const totalAmount = orderData.price * orderData.quantity;

  const validateForm = () => {
    const newErrors = {
      clientName: "",
      clientPhone: "",
      orderDate: "",
      status: "",
      garmentDescription: "",
      garmentType: "",
      deposit: "",
      price: "",
      quantity: "",
      dueDate: "",
      balance: "",
    };

    let isValid = true;

    // Client
    if (!orderData.clientName.trim()) {
      newErrors.clientName = tx("auto.clientNameIsRequired_2cf1");
      isValid = false;
    }

    if (!orderData.clientPhone.trim()) {
      newErrors.clientPhone = tx("auto.clientPhoneIsRequired_85e2");
      isValid = false;
    }

    // Garment
    if (!orderData.garmentDescription.trim()) {
      newErrors.garmentDescription = tx("auto.designStyleNameIsRequired_8df7");
      isValid = false;
    }

    // Quantity
    if (!orderData.quantity || orderData.quantity < 1) {
      newErrors.quantity = tx("auto.quantityMustBeAtLeast_1382");
      isValid = false;
    }

    // Due date
    if (!orderData.dueDate) {
      newErrors.dueDate = tx("auto.deliveryDateIsRequired_c596");
      isValid = false;
    }

    // Price
    if (!orderData.price || orderData.price <= 0) {
      newErrors.price = tx("auto.basePriceMustBeGreater_b892");
      isValid = false;
    }

    // Deposit
    const totalAmount = orderData.price * orderData.quantity;

    if (orderData.deposit < 0) {
      newErrors.deposit = tx("auto.depositCannotBeNegative_d7f8");
      isValid = false;
    }

    if (orderData.deposit > totalAmount) {
      newErrors.deposit = tx("auto.depositCannotBeGreaterThan_5b85");
      isValid = false;
    }

    // Update error state once
    setError(newErrors);

    return isValid;
  };

  const handleCreateOrder = async () => {
    if (!validateForm() || blockUntilRate()) return;

    try {
      const unitPrice = toNaira(orderData.price) ?? 0;
      const deposit = toNaira(orderData.deposit) ?? 0;
      const payload: Order = {
        ...orderData,
        price: unitPrice,
        deposit,
        clientId: selectedClient ? selectedClient.id : "",
        balance: unitPrice * orderData.quantity - deposit,
        paymentStatus:
          orderData.deposit >= orderData.price * orderData.quantity
            ? "paid"
            : orderData.deposit > 0
              ? "partial"
              : "unpaid",
      };

      await createOrder(payload);
      handleBack();
    } catch (error) {
      console.error("Error creating order", error);
    }
  };

  useEffect(() => {
    if (foundClient) {
      setSelectedClient(foundClient);
      setOrderData((prev) => ({
        ...prev,
        clientId: foundClient?.id,
        clientName: foundClient?.name,
        clientPhone: foundClient?.phone,
        measurements: {
          ...prev.measurements,
          ...extractClientMeasurements(foundClient),
        },
      }));
    }
  }, [foundClient, orderData.measurements]);

  const handleBack = () => {
    router.replace("/(tabs)/Orders");
  };

  return (
    <>
      <View
        style={{ flex: 1, paddingTop: top, backgroundColor: bg }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        <View style={styles.header}>
          <HapticTab
            style={{
              width: 32,
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleBack}
          >
            <ChevronLeft
              size={scale(20)}
              color={isDark ? "rgba(200,200,200,1)" : "rgba(54, 65, 83, 1)"}
              strokeWidth={1.5}
            />
          </HapticTab>

          <Text style={[styles.reg24, { color: textColor }]}>{tx("auto.createOrder_f69d")}</Text>
        </View>

        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: bg,
          }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={
            Platform.OS === "ios" ? spacing(50) : spacing(0)
          }
        >
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
              <View style={Styles.inputContainer}>
                <Text style={[Styles.label, { color: labelColor }]}>{tx("auto.clients_28e2")}</Text>
                <Pressable
                  style={[Styles.input, { ...styles.row, paddingVertical: 0, backgroundColor: inputBg, borderColor: inputBorder }]}
                  onPress={toggleClientModal}
                >
                  {selectedClient ? (
                    <Text
                      style={[Styles.reg16, { color: dropdownTextColor }]}
                    >
                      {selectedClient.name}
                    </Text>
                  ) : (
                    <Text
                      style={[Styles.reg16, { color: dropdownTextColor }]}
                    >
                      {tx("auto.selectAClient_b222")}
                    </Text>
                  )}

                  <ChevronDown size={scale(20)} color={chevronColor} />
                </Pressable>
              </View>

              <View style={[styles.detailBox, { backgroundColor: detailBoxBg, borderColor: detailBoxBorder }]}>
                <View style={Styles.inputContainer}>
                  <Text style={[Styles.label, { color: labelColor }]}>
                    {tx("auto.name_709a")}<Text style={styles.red}> *</Text>
                  </Text>
                  <TextInput
                    value={orderData.clientName}
                    onChangeText={(text) =>
                      handleDataChange("clientName", text)
                    }
                    placeholder={tx("auto.eGAdaezeOkonkwo_e13e")}
                    placeholderTextColor={placeholderColor}
                    returnKeyLabel="next"
                    returnKeyType="next"
                    keyboardType="default"
                    autoCorrect={false}
                    style={[
                      Styles.input,
                      {
                        paddingVertical: 0,
                        backgroundColor: inputBg,
                        borderColor: inputBorder,
                        paddingHorizontal: spacing(16),
                        color: inputTextColor,
                      },
                    ]}
                  />
                  {error.clientName ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.clientName}
                    </Text>
                  ) : null}
                </View>

                <View style={Styles.inputContainer}>
                  <Text style={[Styles.label, { color: labelColor }]}>
                    {tx("auto.phone_7706")}<Text style={styles.red}> *</Text>
                  </Text>
                  <TextInput
                    value={orderData.clientPhone}
                    onChangeText={(text) =>
                      handleDataChange("clientPhone", text)
                    }
                    placeholder={tx("auto.eG234801234_527b")}
                    placeholderTextColor={placeholderColor}
                    returnKeyLabel="next"
                    returnKeyType="next"
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    style={[
                      Styles.input,
                      {
                        paddingVertical: 0,
                        backgroundColor: inputBg,
                        borderColor: inputBorder,
                        paddingHorizontal: spacing(16),
                        color: inputTextColor,
                      },
                    ]}
                  />
                  {error.clientPhone ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.clientPhone}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={Styles.inputContainer}>
                <Text style={[Styles.label, { color: labelColor }]}>{tx("auto.orderStatus_a15b")}</Text>
                <Pressable
                  style={[Styles.input, { ...styles.row, paddingVertical: 0, backgroundColor: inputBg, borderColor: inputBorder }]}
                  onPress={toggleStatusModal}
                >
                  <Text
                    style={[Styles.reg16, { color: dropdownActiveColor }]}
                  >
                    {CapitalizeFirstName(orderData.status)}
                  </Text>

                  <ChevronDown size={scale(20)} color={chevronColor} />
                </Pressable>
              </View>

              <View style={Styles.inputContainer}>
                <Text style={[Styles.label, { color: labelColor }]}>
                  {tx("auto.designStyleName_2d4a")}<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={orderData.garmentDescription}
                  onChangeText={(text) =>
                    handleDataChange("garmentDescription", text)
                  }
                  placeholder={tx("auto.eGElegantWeddingGown_52db")}
                  placeholderTextColor={placeholderColor}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  autoCorrect={false}
                  style={[
                    Styles.input,
                    {
                      paddingVertical: 0,
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      paddingHorizontal: spacing(16),
                      color: inputTextColor,
                    },
                  ]}
                />
                {error.garmentDescription ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.garmentDescription}
                  </Text>
                ) : null}
              </View>

              <View style={[styles.row, { gap: spacing(20) }]}>
                <View style={[Styles.inputContainer, { flex: 1 }]}>
                  <Text style={[Styles.label, { color: labelColor }]}>{tx("auto.fabricType_ce68")}</Text>
                  <Pressable
                    style={[
                      Styles.input,
                      { ...styles.row, paddingVertical: 0, backgroundColor: inputBg, borderColor: inputBorder },
                    ]}
                    onPress={toggleTypeModal}
                  >
                    <Text
                      style={[Styles.reg16, { color: dropdownActiveColor }]}
                    >
                      {CapitalizeFirstName(orderData.garmentType)}
                    </Text>

                    <ChevronDown size={scale(20)} color={chevronColor} />
                  </Pressable>
                </View>

                <View style={[Styles.inputContainer, { flex: 1 }]}>
                  <Text style={[Styles.label, { color: labelColor }]}>
                    {tx("auto.quantity_44f6")}<Text style={styles.red}> *</Text>
                  </Text>
                  <TextInput
                    value={orderData.quantity.toString()}
                    onChangeText={(text) =>
                      handleDataChange("quantity", Number(text))
                    }
                    placeholder={tx("auto.eG5_9b53")}
                    placeholderTextColor={placeholderColor}
                    returnKeyLabel="next"
                    returnKeyType="next"
                    keyboardType="number-pad"
                    autoCorrect={false}
                    style={[
                      Styles.input,
                      {
                        paddingVertical: 0,
                        backgroundColor: inputBg,
                        borderColor: inputBorder,
                        paddingHorizontal: spacing(16),
                        color: inputTextColor,
                      },
                    ]}
                  />
                  {error.quantity ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.quantity}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={{}}>
                <Text style={[Styles.label, { color: labelColor }]}>{tx("auto.measurements_737b")}</Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: spacing(8),
                  }}
                >
                  {Object.keys(orderData.measurements).map(
                    (measurement, index) => {
                      return (
                        <View
                          style={[
                            Styles.inputContainer,
                            {
                              width: `${95 / 3}%`,
                              marginTop: spacing(15),
                            },
                          ]}
                          key={index}
                        >
                          <Text style={[Styles.label, { color: labelColor }]}>
                            {CapitalizeFirstName(measurement)}
                          </Text>
                          <TextInput
                            value={orderData.measurements[measurement]}
                            onChangeText={(text) =>
                              handleMeasurementUpdate(`${measurement}`, text)
                            }
                            placeholder={`${CapitalizeFirstName(measurement)}`}
                            placeholderTextColor={placeholderColor}
                            returnKeyLabel="next"
                            returnKeyType="next"
                            keyboardType="number-pad"
                            autoCorrect={false}
                            style={[
                              Styles.input,
                              {
                                paddingVertical: 0,
                                backgroundColor: inputBg,
                                borderColor: inputBorder,
                                paddingHorizontal: spacing(16),
                                color: inputTextColor,
                              },
                            ]}
                          />
                        </View>
                      );
                    },
                  )}
                </View>
              </View>

              <View style={Styles.inputContainer}>
                <Text style={[Styles.label, { color: labelColor }]}>
                  {tx("auto.deliveryDate_7e86")}<Text style={styles.red}> *</Text>
                </Text>
                <Pressable
                  style={[
                    Styles.input,
                    { ...styles.gapRow, paddingVertical: 0, backgroundColor: inputBg, borderColor: inputBorder },
                  ]}
                  onPress={() => setShowPicker(true)}
                >
                  <Calendar size={scale(20)} color={chevronColor} />
                  {orderData.dueDate ? (
                    <Text
                      style={[Styles.reg16, { color: dropdownActiveColor }]}
                    >
                      {GetDetailedDate(orderData.dueDate)}
                    </Text>
                  ) : (
                    <Text
                      style={[Styles.reg16, { color: dropdownTextColor }]}
                    >
                      {tx("auto.selectDate_b84a")}
                    </Text>
                  )}
                  {error.dueDate ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.dueDate}
                    </Text>
                  ) : null}
                </Pressable>

                {showPicker && (
                  <DateTimePicker
                    value={
                      orderData.dueDate
                        ? new Date(orderData.dueDate)
                        : new Date()
                    }
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event: any, date?: Date) => {
                      if (event.type === "set" && date) {
                        setOrderData({
                          ...orderData,
                          dueDate: FormatDateToYYYYMMDD(date.toISOString()),
                        });
                      }
                      setShowPicker(false);
                    }}
                  />
                )}
              </View>

              <View style={[styles.summaryBox, { backgroundColor: summaryBoxBg, borderColor: summaryBoxBorder }]}>
                <Text style={[Styles.med14, { color: summaryTitleColor }]}>
                  {tx("auto.pricing_a0d9")}
                </Text>

                <View style={[styles.row, { gap: spacing(20) }]}>
                  <View style={[Styles.inputContainer, { flex: 1 }]}>
                    <Text style={[Styles.label, { color: labelColor }]}>{tx("auto.basePrice_1698")}{symbol})</Text>
                    <TextInput
                      value={
                        orderData.price === 0 ? "" : orderData.price.toString()
                      }
                      onChangeText={(text) =>
                        handleDataChange("price", Number(text))
                      }
                      placeholder={tx("auto.eG50000_d1af")}
                      placeholderTextColor={placeholderColor}
                      returnKeyLabel="next"
                      returnKeyType="next"
                      keyboardType="number-pad"
                      autoCorrect={false}
                      style={[
                        Styles.input,
                        {
                          paddingVertical: 0,
                          backgroundColor: inputBg,
                          borderColor: inputBorder,
                          paddingHorizontal: spacing(16),
                          color: inputTextColor,
                        },
                      ]}
                    />
                  </View>

                  <View style={[Styles.inputContainer, { flex: 1 }]}>
                    <Text style={[Styles.label, { color: labelColor }]}>{tx("auto.depositPaid_b41f")}{symbol})</Text>
                    <TextInput
                      value={
                        orderData.deposit === 0
                          ? ""
                          : orderData.deposit.toString()
                      }
                      onChangeText={(text) =>
                        handleDataChange("deposit", Number(text))
                      }
                      placeholder={tx("auto.eG25000_6a2b")}
                      placeholderTextColor={placeholderColor}
                      returnKeyLabel="next"
                      returnKeyType="next"
                      keyboardType="number-pad"
                      autoCorrect={false}
                      style={[
                        Styles.input,
                        {
                          paddingVertical: 0,
                          backgroundColor: inputBg,
                          borderColor: inputBorder,
                          paddingHorizontal: spacing(16),
                          color: inputTextColor,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.col,
                    {
                      paddingBottom: spacing(8),
                      borderBottomWidth: 1.5,
                      borderBottomColor: isDark ? "rgba(120,90,0,0.4)" : "rgba(255, 210, 48, 0.3)",
                    },
                  ]}
                >
                  <View style={styles.row}>
                    <Text style={[Styles.reg14, { color: inputTextColor }]}>
                      {tx("auto.totalAmount_a10e")}
                    </Text>
                    <EntryMoney amount={totalAmount} color={inputTextColor} align="end" />
                  </View>

                  <View style={styles.row}>
                    <Text style={[Styles.reg14, { color: inputTextColor }]}>
                      {tx("auto.deposit_b8ca")}
                    </Text>
                    <EntryMoney amount={orderData.deposit} color={inputTextColor} align="end" />
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={[Styles.reg14, { color: inputTextColor }]}>
                    {tx("auto.balance_802d")}
                  </Text>
                  <EntryMoney amount={totalAmount - orderData.deposit} color={inputTextColor} align="end" />
                </View>
                {error.price || error.deposit ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.price}-{error.deposit}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={[Styles.label, { color: labelColor }]}>{tx("auto.specialInstructionsNotes_7ea3")}</Text>
                <TextInput
                  value={orderData.specialInstructions}
                  onChangeText={(text) =>
                    handleDataChange("specialInstructions", text)
                  }
                  placeholder={tx("auto.anySpecialRequirementsModificati_d888")}
                  placeholderTextColor={placeholderColor}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  autoCorrect={false}
                  multiline
                  numberOfLines={20}
                  style={[
                    Styles.input,
                    {
                      height: 100,
                      textAlignVertical: "top",
                      paddingTop: spacing(15),
                      paddingVertical: 0,
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      paddingHorizontal: spacing(16),
                      color: inputTextColor,
                    },
                  ]}
                />
              </View>

              <View style={styles.button}>
                <PrimaryButton
                  title={tx("auto.createOrder_0289")}
                  onPress={handleCreateOrder}
                  loading={loading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      {clientModal && (
        <SelectClientModal
          visible={clientModal}
          handleOption={(client) => {
            setSelectedClient(client);
            setOrderData((prev) => ({
              ...prev,
              clientId: client?.id,
              clientName: client?.name,
              clientPhone: client?.phone,
              measurements: {
                ...prev.measurements,
                ...extractClientMeasurements(client),
              },
            }));
            console.log(
              "client measurements",
              JSON.stringify(client?.measurements, null, 2),
            );
            console.log(
              "measurements",
              JSON.stringify(orderData.measurements, null, 2),
            );
          }}
          onClose={() => setClientModal(false)}
        />
      )}
      {statusModal && (
        <SelectFilterModal
          data={orderStatusList}
          visible={statusModal}
          handleOption={(option) => handleDataChange("status", option)}
          selected={orderData.status}
          onClose={() => setStatusModal(false)}
        />
      )}
      {typeModal && (
        <SelectFilterModal
          data={orderGarmentTypeList}
          visible={typeModal}
          handleOption={(option) => handleDataChange("garmentType", option)}
          selected={orderData.status}
          onClose={() => setTypeModal(false)}
        />
      )}
    </>
  );
};

export default CreateOrderScreen;

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
  reg24: {
    fontFamily: "regular",
    fontSize: scaleFontSize(24),
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
    gap: spacing(14),
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
    gap: spacing(14),
  },
  red: {
    color: "rgba(251, 44, 54, 1)",
  },
  detailBox: {
    padding: spacing(17),
    borderWidth: 1.1,
    borderRadius: 16,
    gap: spacing(12),
  },
  summaryBox: {
    marginTop: spacing(10),
    padding: spacing(17),
    borderWidth: 1.1,
    borderRadius: 16,
    gap: spacing(10),
  },
  button: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
