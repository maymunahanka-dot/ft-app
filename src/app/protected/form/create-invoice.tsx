import PrimaryButton from "@/src/components/button/PrimaryButton";
import SelectClientModal from "@/src/components/form/order/SelectClientModal";
import { HapticTab } from "@/src/components/haptic-tab";
import { ColorWheelPicker } from "@/src/components/invoice/ColorWheelPicker";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useClientStore } from "@/src/stores/clientSlice";
import { useInvoiceStore } from "@/src/stores/invoiceSlice";
import { useUserStore } from "@/src/stores/userSlice";
import { Client } from "@/src/types/client";
import { InvoiceData, InvoiceItem } from "@/src/types/Invoice";
import {
  FormatCurrency,
  FormatDateToYYYYMMDD,
  formatInvoiceDate,
  formatPrice,
  GetDetailedDate,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  Plus,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
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

const CreateInvoiceScreen = () => {
  const { clientId } = useLocalSearchParams<{ clientId?: string }>();
  const clients = useClientStore((state) => state.clients);
  const foundClient = clients.find((prev) => prev.id === clientId?.toString());

  const user = useUserStore((state) => state.user);
  const brandSetting = useUserStore((state) => state.brandSetting);
  const createInvoice = useInvoiceStore((state) => state.createInvoice);
  const loading = useInvoiceStore((state) => state.loading);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientModal, setClientModal] = useState(false);
  const toggleClientModal = () => setClientModal((prev) => !prev);

  const [datePickerFor, setDatePickerFor] = useState<
    "invoiceDate" | "dueDate" | null
  >(null);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString(),
    dueDate: "",
    terms: "Due on Receipt",
    businessName: user ? (user.name ?? "") : "",
    businessAddress: brandSetting ? (brandSetting.businessAddress ?? "") : "",
    logoUrl: user ? (user.logo ?? "") : "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    currency: "NGN",
    items: [{ description: "", quantity: 0, price: 0 }],
    notes: [],
    termsAndConditions: "NO REFUND AFTER PAYMENT",
    themeColor: "#16988D",
  });

  const [error, setError] = useState({
    clientName: "",
    invoiceDate: "",
    dueDate: "",
    terms: "",
    items: "",
  });

  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});

  const totals = useMemo(() => {
    const sub = invoiceData.items.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.price),
      0,
    );
    const t = (7.5 / 100) * sub;

    return {
      subTotal: sub,
      tax: t,
      total: sub + t,
    };
  }, [invoiceData.items]);

  const handleDetailsChange = (
    field: keyof typeof invoiceData,
    value: string | string[],
  ) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, price: 0 }],
    }));
    setItemErrors((prev) => {
      const next = { ...prev };
      delete next[invoiceData.items.length];
      return next;
    });
  };

  const removeItem = (index: number) => {
    if (invoiceData.items.length <= 1) {
      return;
    }
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    setInvoiceData((prev) => {
      const items = [...prev.items];
      const item = { ...items[index], [field]: value };
      if (field === "description" && typeof value === "string")
        item.description = value;
      else if (field === "quantity")
        item.quantity =
          typeof value === "number" ? value : parseInt(value, 10) || 0;
      else if (field === "price")
        item.price =
          typeof value === "number"
            ? value
            : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
      items[index] = item;
      return { ...prev, items };
    });
    if (itemErrors[index]) {
      setItemErrors((prev) => ({ ...prev, [index]: "" }));
    }
    if (error.items) setError((prev) => ({ ...prev, items: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      clientName: "",
      invoiceDate: "",
      dueDate: "",
      terms: "",
      items: "",
    };
    const newItemErrors: Record<number, string> = {};

    let isValid = true;

    if (!invoiceData.clientName?.trim()) {
      newErrors.clientName = "Bill to (client) is required";
      isValid = false;
    }

    if (!invoiceData.invoiceDate.trim()) {
      newErrors.invoiceDate = "Invoice date is required";
      isValid = false;
    }

    if (!invoiceData.dueDate.trim()) {
      newErrors.dueDate = "Due date is required";
      isValid = false;
    }

    const hasValidItem = invoiceData.items.some(
      (i) => i.description.trim() && i.quantity >= 1 && i.price > 0,
    );
    if (!hasValidItem) {
      newErrors.items =
        "Add at least one item with description, quantity and price";
      isValid = false;
    }

    invoiceData.items.forEach((item, index) => {
      if (!item.description.trim() && (item.quantity > 0 || item.price > 0)) {
        newItemErrors[index] = "Description is required";
        isValid = false;
      } else if (
        item.description.trim() &&
        (item.quantity < 1 || item.price <= 0)
      ) {
        newItemErrors[index] =
          "Quantity must be at least 1 and price greater than 0";
        isValid = false;
      }
    });

    setError(newErrors);
    setItemErrors(newItemErrors);
    return isValid;
  };

  const handleCreateInvoice = async () => {
    if (!validateForm()) return;
    if (!user?.email || !selectedClient) return;

    try {
      const validItems = invoiceData.items.filter(
        (i) => i.description.trim() && i.quantity >= 1 && i.price > 0,
      );
      await createInvoice({
        ...invoiceData,
        dueDate: formatInvoiceDate(invoiceData.dueDate),
        invoiceDate: formatInvoiceDate(invoiceData.invoiceDate),
        items: validItems,
        userEmail: user.email,
        clientId: selectedClient.id,
      });
      handleBack();
    } catch (err) {
      console.error("Error creating invoice", err);
    }
  };

  useEffect(() => {
    if (foundClient) {
      setSelectedClient(foundClient);
      setInvoiceData((prev) => ({
        ...prev,
        clientName: foundClient.name,
        clientPhone: foundClient.phone,
      }));
    }
  }, [foundClient]);

  const handleBack = () => {
    router.replace("/(tabs)/Invoices");
  };

  return (
    <>
      <View
        style={{ flex: 1, paddingTop: spacing(50), backgroundColor: "white" }}
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

          <Text style={styles.reg24}>Create Invoice</Text>
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
                <Text style={Styles.label}>
                  Clients<Text style={styles.red}> *</Text>
                </Text>
                <Pressable
                  style={[Styles.input, { ...styles.row, paddingVertical: 0 }]}
                  onPress={toggleClientModal}
                >
                  {selectedClient ? (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 1)" }]}
                    >
                      {selectedClient.name}
                    </Text>
                  ) : (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 0.5)" }]}
                    >
                      Select client
                    </Text>
                  )}

                  <ChevronDown size={scale(20)} color={Colors.grey} />
                </Pressable>
                {error.clientName ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.clientName}
                  </Text>
                ) : null}
              </View>

              <View style={[styles.row, { gap: spacing(20) }]}>
                <View
                  style={[Styles.inputContainer, { gap: spacing(8), flex: 1 }]}
                >
                  <Text style={[Styles.label]}>
                    Invoice Date<Text style={styles.red}> *</Text>
                  </Text>
                  <Pressable
                    style={styles.datePicker}
                    onPress={() => setDatePickerFor("invoiceDate")}
                  >
                    {invoiceData.invoiceDate ? (
                      <Text
                        style={[Styles.reg12, { color: "rgba(10, 10, 10, 1)" }]}
                      >
                        {GetDetailedDate(invoiceData.invoiceDate)}
                      </Text>
                    ) : (
                      <Text style={styles.reg12}>DD/MM/YYYY</Text>
                    )}
                    <Calendar size={scale(15)} color={Colors.grey} />
                  </Pressable>
                  {error.invoiceDate ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.invoiceDate}
                    </Text>
                  ) : null}
                </View>

                <View
                  style={[Styles.inputContainer, { gap: spacing(8), flex: 1 }]}
                >
                  <Text style={[Styles.label]}>
                    Due Date<Text style={styles.red}> *</Text>
                  </Text>
                  <Pressable
                    style={styles.datePicker}
                    onPress={() => setDatePickerFor("dueDate")}
                  >
                    {invoiceData.dueDate ? (
                      <Text
                        style={[Styles.reg12, { color: "rgba(10, 10, 10, 1)" }]}
                      >
                        {GetDetailedDate(invoiceData.dueDate)}
                      </Text>
                    ) : (
                      <Text style={styles.reg12}>DD/MM/YYYY</Text>
                    )}
                    <Calendar size={scale(15)} color={Colors.grey} />
                  </Pressable>
                  {error.dueDate ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.dueDate}
                    </Text>
                  ) : null}
                </View>
              </View>

              {(datePickerFor === "invoiceDate" ||
                datePickerFor === "dueDate") && (
                <DatePicker
                  modal
                  open={!!datePickerFor}
                  date={
                    datePickerFor === "invoiceDate" && invoiceData.invoiceDate
                      ? new Date(invoiceData.invoiceDate)
                      : datePickerFor === "dueDate" && invoiceData.dueDate
                        ? new Date(invoiceData.dueDate)
                        : new Date()
                  }
                  mode="date"
                  onConfirm={(date) => {
                    const value = FormatDateToYYYYMMDD(date.toISOString());
                    if (datePickerFor === "invoiceDate") {
                      handleDetailsChange("invoiceDate", value);
                    } else {
                      handleDetailsChange("dueDate", value);
                    }
                    setDatePickerFor(null);
                  }}
                  onCancel={() => setDatePickerFor(null)}
                />
              )}

              <View style={[Styles.inputContainer, { gap: spacing(16) }]}>
                <View style={styles.row}>
                  <Text style={[Styles.label]}>
                    Items<Text style={styles.red}> *</Text>
                  </Text>

                  <HapticTab
                    style={[styles.gapRow, { gap: spacing(5) }]}
                    onPress={handleAddItem}
                  >
                    <Plus size={scale(18)} color={Colors.primary} />
                    <Text style={[styles.reg14, { color: Colors.primary }]}>
                      Add Item
                    </Text>
                  </HapticTab>
                </View>
                {error.items ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.items}
                  </Text>
                ) : null}

                {invoiceData.items.map((item, index) => {
                  return (
                    <View style={{ gap: spacing(4) }} key={index}>
                      {invoiceData.items.length! > 1 && (
                        <View
                          style={[
                            styles.gapRow,
                            {
                              gap: spacing(15),
                              justifyContent: "center",
                              paddingVertical: spacing(10),
                            },
                          ]}
                        >
                          <Text style={Styles.label}>Item {index + 1}</Text>
                          <HapticTab
                            style={styles.removeBtn}
                            onPress={() => removeItem(index)}
                          >
                            <X
                              size={scale(10)}
                              color={"white"}
                              strokeWidth={3}
                            />
                          </HapticTab>
                        </View>
                      )}
                      <TextInput
                        value={item.description}
                        onChangeText={(text) =>
                          handleItemChange(index, "description", text)
                        }
                        placeholder="Description"
                        placeholderTextColor={"grey"}
                        style={[Styles.input, { paddingVertical: 0 }]}
                      />

                      <View style={[styles.row, { gap: spacing(20) }]}>
                        <View style={[Styles.inputContainer, { flex: 1 }]}>
                          <Text style={[Styles.label]}>
                            Quantity<Text style={styles.red}> *</Text>
                          </Text>

                          <TextInput
                            value={
                              item.quantity === 0
                                ? ""
                                : item.quantity.toString()
                            }
                            onChangeText={(text) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseInt(text, 10) || 0,
                              )
                            }
                            placeholder="1"
                            placeholderTextColor={"grey"}
                            keyboardType="number-pad"
                            style={[Styles.input]}
                          />
                        </View>

                        <View style={[Styles.inputContainer, { flex: 1 }]}>
                          <Text style={[Styles.label]}>
                            Price<Text style={styles.red}> *</Text>
                          </Text>

                          <TextInput
                            value={formatPrice(
                              item.price === 0 ? "" : item.price.toString(),
                            )}
                            onChangeText={(text) =>
                              handleItemChange(
                                index,
                                "price",
                                parseFloat(text.replace(/[^0-9.]/g, "")) || 0,
                              )
                            }
                            placeholder="₦0"
                            placeholderTextColor={"grey"}
                            keyboardType="decimal-pad"
                            style={[Styles.input]}
                          />
                        </View>
                      </View>
                      {itemErrors[index] ? (
                        <Text
                          style={{
                            ...Styles.reg12,
                            color: "red",
                            marginTop: 4,
                          }}
                        >
                          {itemErrors[index]}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Invoice Theme Color</Text>
                <ColorWheelPicker
                  value={invoiceData.themeColor ?? "#16988D"}
                  onChange={(hex) => handleDetailsChange("themeColor", hex)}
                />
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Notes (Optional)</Text>
                <TextInput
                  value={invoiceData.notes ? invoiceData.notes.join("\n") : ""}
                  onChangeText={(text) =>
                    handleDetailsChange(
                      "notes",
                      text ? text.split("\n").filter(Boolean) : [],
                    )
                  }
                  placeholder="Add payment terms, delivery notes, etc."
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

              <View style={styles.box}>
                <View style={styles.row}>
                  <Text style={[Styles.reg14, { color: Colors.text.black }]}>
                    Subtotal
                  </Text>

                  <Text style={[Styles.reg16, { color: Colors.text.black }]}>
                    {FormatCurrency(totals.subTotal)}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={[Styles.reg14, { color: Colors.text.black }]}>
                    Tax
                  </Text>

                  <Text style={[Styles.reg16, { color: Colors.text.black }]}>
                    {FormatCurrency(totals.tax)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.row,
                    {
                      borderTopWidth: 0.5,
                      borderTopColor: Colors.primary20,
                      paddingTop: spacing(10),
                    },
                  ]}
                >
                  <Text style={[Styles.reg14, { color: Colors.text.black }]}>
                    Total
                  </Text>

                  <Text
                    style={[
                      Styles.reg16,
                      { color: Colors.primary, fontSize: scaleFontSize(24) },
                    ]}
                  >
                    {FormatCurrency(totals.total)}
                  </Text>
                </View>
              </View>

              <View style={styles.button}>
                <PrimaryButton
                  title="Create Invoice"
                  onPress={handleCreateInvoice}
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
            setInvoiceData((prev) => ({
              ...prev,
              clientName: client.name,
              clientPhone: client.phone,
              clientEmail: client.email,
            }));
            if (error.clientName)
              setError((prev) => ({ ...prev, clientName: "" }));
          }}
          onClose={() => setClientModal(false)}
        />
      )}
    </>
  );
};

export default CreateInvoiceScreen;

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
  reg12: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
    color: "#99A1AF",
  },
  reg14: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: "#4A5565",
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
    gap: spacing(24),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowDateBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    // gap: spacing(20),
  },
  gapRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(14),
  },
  removeBtn: {
    backgroundColor: "#E7000B",
    width: 18,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  red: {
    color: "rgba(251, 44, 54, 1)",
  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing(15),
    paddingHorizontal: spacing(13),
    height: 50,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
  },
  box: {
    padding: spacing(16),
    backgroundColor: "#E8F5F4",
    gap: spacing(10),
    borderRadius: 16,
  },
  button: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
