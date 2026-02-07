import PrimaryButton from "@/src/components/button/PrimaryButton";
import SelectClientModal from "@/src/components/form/order/SelectClientModal";
import { HapticTab } from "@/src/components/haptic-tab";
import SelectFilterModal from "@/src/components/shared/modal/SelectFilterModal";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { GenerateOrderId } from "@/src/lib/order";
import { useClientStore } from "@/src/stores/clientSlice";
import { useOrderStore } from "@/src/stores/orderSlice";
import { Client } from "@/src/types/client";
import { Order } from "@/src/types/Order";
import {
  CapitalizeFirstName,
  FormatCurrency,
  FormatDateToYYYYMMDD,
  GetDetailedDate,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar, ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
import DatePicker from "react-native-date-picker";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const { clientId } = useLocalSearchParams<{ clientId?: string }>();
  const clients = useClientStore((state) => state.clients);
  const foundClient = clients.find((prev) => prev.id === clientId?.toString());

  const createOrder = useOrderStore((state) => state.saveOrder);
  const loading = useOrderStore((state) => state.loading);

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
    },
    balance: 0,
    paymentStatus: "unpaid",
    tailorId: "",
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
      newErrors.clientName = "Client name is required";
      isValid = false;
    }

    if (!orderData.clientPhone.trim()) {
      newErrors.clientPhone = "Client phone is required";
      isValid = false;
    }

    // Garment
    if (!orderData.garmentDescription.trim()) {
      newErrors.garmentDescription = "Design / style name is required";
      isValid = false;
    }

    // Quantity
    if (!orderData.quantity || orderData.quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
      isValid = false;
    }

    // Due date
    if (!orderData.dueDate) {
      newErrors.dueDate = "Delivery date is required";
      isValid = false;
    }

    // Price
    if (!orderData.price || orderData.price <= 0) {
      newErrors.price = "Base price must be greater than 0";
      isValid = false;
    }

    // Deposit
    const totalAmount = orderData.price * orderData.quantity;

    if (orderData.deposit < 0) {
      newErrors.deposit = "Deposit cannot be negative";
      isValid = false;
    }

    if (orderData.deposit > totalAmount) {
      newErrors.deposit = "Deposit cannot be greater than total amount";
      isValid = false;
    }

    // Update error state once
    setError(newErrors);

    return isValid;
  };

  const handleCreateOrder = async () => {
    if (!validateForm()) return;

    try {
      const payload: Order = {
        ...orderData,
        clientId: selectedClient ? selectedClient.id : "",
        balance: orderData.price * orderData.quantity - orderData.deposit,
        paymentStatus:
          orderData.deposit >= orderData.price * orderData.quantity
            ? "paid"
            : orderData.deposit > 0
              ? "partial"
              : "unpaid",
        updatedAt: new Date().toISOString(),
      };

      await createOrder(payload);
      router.back();
    } catch (error) {
      console.error("Error creating order", error);
    }
  };

  useEffect(() => {
    if (foundClient) {
      setSelectedClient(foundClient);
    }
  }, [foundClient]);

  const handleBack = () => {
    router.replace("/(tabs)/Orders");
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
            onPress={handleBack}
          >
            <ChevronLeft
              size={scale(20)}
              color={"rgba(54, 65, 83, 1)"}
              strokeWidth={1.5}
            />
          </HapticTab>

          <Text style={styles.reg24}>Create order</Text>
        </View>

        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: "white",
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
                <Text style={Styles.label}>Clients</Text>
                <Pressable
                  style={[Styles.input, { ...styles.row, paddingVertical: 0 }]}
                  onPress={toggleClientModal}
                >
                  {selectedClient ? (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 0.5)" }]}
                    >
                      {selectedClient.name}
                    </Text>
                  ) : (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 0.5)" }]}
                    >
                      Select a Client
                    </Text>
                  )}

                  <ChevronDown size={scale(20)} color={Colors.grey} />
                </Pressable>
              </View>

              <View style={styles.detailBox}>
                <View style={Styles.inputContainer}>
                  <Text style={Styles.label}>
                    Name<Text style={styles.red}> *</Text>
                  </Text>
                  <TextInput
                    value={orderData.clientName}
                    onChangeText={(text) =>
                      handleDataChange("clientName", text)
                    }
                    placeholder="e.g., Adaeze Okonkwo"
                    placeholderTextColor={Colors.grayText}
                    returnKeyLabel="next"
                    returnKeyType="next"
                    keyboardType="default"
                    autoCorrect={false}
                    style={[
                      Styles.input,
                      {
                        paddingVertical: 0,
                        backgroundColor: "white",
                        paddingHorizontal: spacing(16),
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
                  <Text style={Styles.label}>
                    Phone<Text style={styles.red}> *</Text>
                  </Text>
                  <TextInput
                    value={orderData.clientPhone}
                    onChangeText={(text) =>
                      handleDataChange("clientPhone", text)
                    }
                    placeholder="e.g., +234 801 234 5678"
                    placeholderTextColor={Colors.grayText}
                    returnKeyLabel="next"
                    returnKeyType="next"
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    style={[
                      Styles.input,
                      {
                        paddingVertical: 0,
                        backgroundColor: "white",
                        paddingHorizontal: spacing(16),
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
                <Text style={Styles.label}>Order Status</Text>
                <Pressable
                  style={[Styles.input, { ...styles.row, paddingVertical: 0 }]}
                  onPress={toggleStatusModal}
                >
                  <Text
                    style={[Styles.reg16, { color: "rgba(10, 10, 10, 1)" }]}
                  >
                    {CapitalizeFirstName(orderData.status)}
                  </Text>

                  <ChevronDown size={scale(20)} color={Colors.grey} />
                </Pressable>
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Design/Style Name<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={orderData.garmentDescription}
                  onChangeText={(text) =>
                    handleDataChange("garmentDescription", text)
                  }
                  placeholder="e.g., Elegant Wedding Gown"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  autoCorrect={false}
                  style={[
                    Styles.input,
                    {
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
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
                  <Text style={Styles.label}>Fabric Type</Text>
                  <Pressable
                    style={[
                      Styles.input,
                      { ...styles.row, paddingVertical: 0 },
                    ]}
                    onPress={toggleTypeModal}
                  >
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 1)" }]}
                    >
                      {CapitalizeFirstName(orderData.garmentType)}
                    </Text>

                    <ChevronDown size={scale(20)} color={Colors.grey} />
                  </Pressable>
                </View>

                <View style={[Styles.inputContainer, { flex: 1 }]}>
                  <Text style={Styles.label}>
                    Quantity<Text style={styles.red}> *</Text>
                  </Text>
                  <TextInput
                    value={orderData.quantity.toString()}
                    onChangeText={(text) =>
                      handleDataChange("quantity", Number(text))
                    }
                    placeholder="e.g., 5"
                    placeholderTextColor={Colors.grayText}
                    returnKeyLabel="next"
                    returnKeyType="next"
                    keyboardType="number-pad"
                    autoCorrect={false}
                    style={[
                      Styles.input,
                      {
                        paddingVertical: 0,
                        backgroundColor: "white",
                        paddingHorizontal: spacing(16),
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
                <Text style={Styles.label}>Measurements</Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    // gap: spacing(10),
                  }}
                >
                  {[
                    "chest",
                    "hips",
                    "length",
                    "notes",
                    "shoulder",
                    "sleeveLength",
                    "waist",
                  ].map((measurement, index) => {
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
                        <Text style={Styles.label}>
                          {CapitalizeFirstName(measurement)}
                        </Text>
                        <TextInput
                          value={orderData.measurements[measurement]}
                          onChangeText={(text) =>
                            handleMeasurementUpdate(`${measurement}`, text)
                          }
                          placeholder={`${CapitalizeFirstName(measurement)}`}
                          placeholderTextColor={Colors.grayText}
                          returnKeyLabel="next"
                          returnKeyType="next"
                          keyboardType="number-pad"
                          autoCorrect={false}
                          style={[
                            Styles.input,
                            {
                              paddingVertical: 0,
                              backgroundColor: "white",
                              paddingHorizontal: spacing(16),
                            },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Delivery Date<Text style={styles.red}> *</Text>
                </Text>
                <Pressable
                  style={[
                    Styles.input,
                    { ...styles.gapRow, paddingVertical: 0 },
                  ]}
                  onPress={() => setShowPicker(true)}
                >
                  <Calendar size={scale(20)} color={Colors.grey} />
                  {orderData.dueDate ? (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 1)" }]}
                    >
                      {GetDetailedDate(orderData.dueDate)}
                    </Text>
                  ) : (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 0.5)" }]}
                    >
                      Select date
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
                  <DatePicker
                    modal
                    open={showPicker}
                    date={
                      orderData.dueDate
                        ? new Date(orderData.dueDate)
                        : new Date()
                    }
                    mode="date"
                    onConfirm={(date) => {
                      setShowPicker(false);
                      setOrderData({
                        ...orderData,
                        dueDate: FormatDateToYYYYMMDD(date.toISOString()),
                      });
                    }}
                    onCancel={() => {
                      setShowPicker(false);
                    }}
                  />
                )}
              </View>

              <View style={styles.summaryBox}>
                <Text style={[Styles.med14, { color: "rgba(123, 51, 6, 1)" }]}>
                  Pricing
                </Text>

                <View style={[styles.row, { gap: spacing(20) }]}>
                  <View style={[Styles.inputContainer, { flex: 1 }]}>
                    <Text style={Styles.label}>Base Price (₦)</Text>
                    <TextInput
                      value={orderData.price.toString()}
                      onChangeText={(text) =>
                        handleDataChange("price", Number(text))
                      }
                      placeholder="e.g., 50000"
                      placeholderTextColor={Colors.grayText}
                      returnKeyLabel="next"
                      returnKeyType="next"
                      keyboardType="number-pad"
                      autoCorrect={false}
                      style={[
                        Styles.input,
                        {
                          paddingVertical: 0,
                          backgroundColor: "white",
                          paddingHorizontal: spacing(16),
                        },
                      ]}
                    />
                  </View>

                  <View style={[Styles.inputContainer, { flex: 1 }]}>
                    <Text style={Styles.label}>Deposit Paid (₦)</Text>
                    <TextInput
                      value={orderData.deposit.toString()}
                      onChangeText={(text) =>
                        handleDataChange("deposit", Number(text))
                      }
                      placeholder="e.g., 25000"
                      placeholderTextColor={Colors.grayText}
                      returnKeyLabel="next"
                      returnKeyType="next"
                      keyboardType="number-pad"
                      autoCorrect={false}
                      style={[
                        Styles.input,
                        {
                          paddingVertical: 0,
                          backgroundColor: "white",
                          paddingHorizontal: spacing(16),
                        },
                      ]}
                    />
                  </View>
                  {error.price || error.deposit ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.price}, {error.deposit}
                    </Text>
                  ) : null}
                </View>

                <View
                  style={[
                    styles.col,
                    {
                      paddingBottom: spacing(8),
                      borderBottomWidth: 1.5,
                      borderBottomColor: "rgba(255, 210, 48, 0.3)",
                    },
                  ]}
                >
                  <View style={styles.row}>
                    <Text style={[Styles.reg14, { color: Colors.text.black }]}>
                      Total Amount:
                    </Text>
                    <Text style={[Styles.reg16, { color: Colors.text.black }]}>
                      {FormatCurrency(totalAmount)}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={[Styles.reg14, { color: Colors.text.black }]}>
                      Deposit:
                    </Text>
                    <Text style={[Styles.reg16, { color: Colors.text.black }]}>
                      {FormatCurrency(orderData.deposit)}
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={[Styles.reg14, { color: Colors.text.black }]}>
                    Balance:
                  </Text>
                  <Text style={[Styles.reg16, { color: Colors.text.black }]}>
                    {FormatCurrency(totalAmount - orderData.deposit)}
                  </Text>
                </View>
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Special Instructions / Notes</Text>
                <TextInput
                  value={orderData.specialInstructions}
                  onChangeText={(text) =>
                    handleDataChange("specialInstructions", text)
                  }
                  placeholder="Any special requirements, modifications, or notes..."
                  placeholderTextColor={Colors.grayText}
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
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
              </View>

              <View style={styles.button}>
                <PrimaryButton
                  title="Create Order"
                  onPress={handleCreateOrder}
                  loading={loading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {clientModal && (
        <SelectClientModal
          visible={clientModal}
          handleOption={(client) => {
            setSelectedClient(client);
            setOrderData((prev) => ({
              ...prev,
              clientName: client.name,
              clientPhone: client.phone,
            }));
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
    // paddingVertical: spacing(20),
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
    backgroundColor: "rgba(239, 246, 255, 1)",
    padding: spacing(17),
    borderWidth: 1.1,
    borderColor: "rgba(190, 219, 255, 1)",
    borderRadius: 16,
    gap: spacing(12),
  },
  summaryBox: {
    marginTop: spacing(10),
    backgroundColor: "rgba(254, 230, 133, 0.3)",
    padding: spacing(17),
    borderWidth: 1.1,
    borderRadius: 16,
    borderColor: "rgba(254, 230, 133, 0.3)",
    gap: spacing(10),
  },
  button: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
