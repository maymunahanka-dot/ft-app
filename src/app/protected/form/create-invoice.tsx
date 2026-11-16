/**
 * Create Invoice: same form as the web app's Create Invoice panel.
 *
 * Sections: client details (pick an existing client or type them in), invoice / due date,
 * payment method and status, items (a service or an inventory item with its stock), discount
 * and tax rate, notes, and a summary. The saved invoice has the same fields as one made on
 * the web, and selling inventory items lowers their stock.
 */
import PrimaryButton from "@/src/components/button/PrimaryButton";
import SelectClientModal from "@/src/components/form/order/SelectClientModal";
import { HapticTab } from "@/src/components/haptic-tab";
import SelectFilterModal from "@/src/components/shared/modal/SelectFilterModal";
import { EntryMoney } from "@/src/components/shared/MoneyAmount";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { useDisplayCurrency } from "@/src/hooks/useDisplayCurrency";
import { tl } from "@/src/i18n";
import { apiFetch } from "@/src/lib/apiClient";
import { useClientStore } from "@/src/stores/clientSlice";
import { useInventoryStore } from "@/src/stores/inventorySlice";
import { useInvoiceStore } from "@/src/stores/invoiceSlice";
import { useUserStore } from "@/src/stores/userSlice";
import { Client } from "@/src/types/client";
import { storedUnitPrice } from "@/src/types/inventory";
import {
  FormatDateToYYYYMMDD,
  formatInvoiceDate,
  GetDetailedDate,
  scale,
  scaleFontSize,
  ShowToastMessage,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Calendar, ChevronDown, ChevronLeft, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ItemType = "Service" | "Item";
type FormItem = {
  key: string;
  itemType: ItemType;
  category: string;
  description: string;
  quantity: string;
  price: string; // in the display currency, as typed
  inventoryItemId: string;
  inventoryItemName: string;
};

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Credit Card", "Mobile Money", "Cheque"];
const STATUSES = ["Unpaid", "Paid", "Partially Paid"];
const SERVICE_TYPES = ["Labor", "Design Work", "Alterations"];
const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: "Service", label: "Service" },
  { value: "Item", label: "Inventory Item" },
];

const newItem = (): FormItem => ({
  key: `${Date.now()}-${Math.random()}`,
  itemType: "Service",
  category: "Labor",
  description: "",
  quantity: "",
  price: "",
  inventoryItemId: "",
  inventoryItemName: "",
});
const isoDay = (offsetDays = 0) => FormatDateToYYYYMMDD(new Date(Date.now() + offsetDays * 86400000).toISOString());
const num = (v: string | number) => {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const generateInvoiceNumber = () => `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

/** Which picker sheet is open. */
type Picker =
  | { kind: "payment" }
  | { kind: "status" }
  | { kind: "itemType"; index: number }
  | { kind: "service"; index: number }
  | { kind: "inventory"; index: number }
  | null;

const CreateInvoiceScreen = () => {
  useTranslation(); // re-render when the language changes
  const { clientId } = useLocalSearchParams<{ clientId?: string }>();
  const clients = useClientStore((state) => state.clients);
  const stocks = useInventoryStore((state) => state.stocks);
  const getInventoryByTailor = useInventoryStore((state) => state.getInventoryByTailor);
  const user = useUserStore((state) => state.user);
  const createInvoice = useInvoiceStore((state) => state.createInvoice);
  const { symbol, toNaira, fromNaira, blockUntilRate } = useDisplayCurrency();

  const { isDark } = useTheme();
  const { top } = useSafeAreaInsets();

  // ── colours (same palette as the other mobile forms) ──
  const bg = isDark ? "#0f0f0f" : "white";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#F9FAFB";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#EEF0F3";
  const textColor = isDark ? Colors.text.white : "rgba(54, 65, 83, 1)";
  const labelColor = isDark ? "rgba(160,160,160,1)" : "#4A5565";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "white";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : Colors.inputBorder;
  const inputTextColor = isDark ? Colors.text.white : Colors.black;
  const placeholderColor = isDark ? "rgba(100,100,100,1)" : Colors.grayText;
  const chevronColor = isDark ? "rgba(160,160,160,1)" : Colors.grey;
  const summaryBoxBg = isDark ? "rgba(22,152,141,0.12)" : "#E8F5F4";
  const summaryDivider = isDark ? "rgba(22,152,141,0.3)" : Colors.primary20;

  // ── form state (mirrors the web panel) ──
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(isoDay(0));
  const [dueDate, setDueDate] = useState(isoDay(7));
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [status, setStatus] = useState("Unpaid");
  const [items, setItems] = useState<FormItem[]>([newItem()]);
  const [discount, setDiscount] = useState("");
  const [taxRate, setTaxRate] = useState("7.5");
  // Typed in only for "Partially Paid"; "Paid" uses the total, "Unpaid" is 0
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [clientModal, setClientModal] = useState(false);
  const [picker, setPicker] = useState<Picker>(null);
  const [datePickerFor, setDatePickerFor] = useState<"invoiceDate" | "dueDate" | null>(null);

  useEffect(() => {
    if (!stocks.length && user?.email) getInventoryByTailor(user.email);
  }, [stocks.length, user?.email, getInventoryByTailor]);

  const fillClient = (client: Client) => {
    setSelectedClientId(client.id);
    setClientName(client.name ?? "");
    setEmail(client.email ?? "");
    setPhone(client.phone ?? "");
    setAddress(client.address ?? "");
    setErrors((prev) => ({ ...prev, clientName: "", email: "" }));
  };

  // Opened from a client's page: start with that client
  useEffect(() => {
    const found = clients.find((c) => c.id === clientId?.toString());
    if (found) fillClient(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, clients]);

  const stockOf = (id: string) => stocks.find((s) => s.id === id)?.quantity ?? 0;

  // ── totals (display currency) ──
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + num(i.quantity) * num(i.price), 0);
    const discountAmount = (subtotal * num(discount)) / 100;
    const taxAmount = ((subtotal - discountAmount) * num(taxRate)) / 100;
    const total = subtotal - discountAmount + taxAmount;
    const paid = status === "Paid" ? total : status === "Partially Paid" ? Math.min(num(amountPaid), total) : 0;
    return { subtotal, discountAmount, taxAmount, total, paid, balance: Math.max(0, total - paid) };
  }, [items, discount, taxRate, status, amountPaid]);

  // ── items ──
  const updateItem = (index: number, patch: Partial<FormItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
    if (errors.items) setErrors((prev) => ({ ...prev, items: "" }));
  };
  const addItem = () => setItems((prev) => [newItem(), ...prev]); // newest on top, like the web
  const removeItem = (index: number) => setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const setItemType = (index: number, itemType: ItemType) =>
    updateItem(index, {
      itemType,
      category: itemType === "Service" ? "Labor" : "Item",
      inventoryItemId: "",
      inventoryItemName: "",
      description: "",
      price: "",
      ...(itemType === "Item" ? { quantity: "" } : {}),
    });

  const pickInventoryItem = (index: number, id: string) => {
    const stock = stocks.find((s) => s.id === id);
    if (!stock) return;
    updateItem(index, {
      inventoryItemId: id,
      inventoryItemName: stock.name,
      description: stock.name,
      category: stock.category,
      price: fromNaira(storedUnitPrice(stock)),
      quantity: "",
    });
  };

  // ── validation + save (same rules as the web) ──
  const validate = () => {
    const next: Record<string, string> = {};
    if (!clientName.trim()) next.clientName = tl("Client name is required");
    if (!email.trim()) next.email = tl("Email is required");
    if (!dueDate.trim()) next.dueDate = tl("Due date is required");
    if (status === "Partially Paid") {
      if (num(amountPaid) <= 0) next.amountPaid = tl("Enter the amount paid");
      else if (num(amountPaid) >= totals.total) next.amountPaid = tl("Amount paid must be less than the total. Use the Paid status instead.");
    }
    if (items.some((i) => !i.description.trim())) next.items = tl("All items must have a description");
    if (!next.items) {
      for (const it of items) {
        if (it.itemType === "Item" && it.inventoryItemId && num(it.quantity) > stockOf(it.inventoryItemId)) {
          next.items = `${tl("Insufficient stock for")} ${it.inventoryItemName} (${tl("Available")}: ${stockOf(it.inventoryItemId)})`;
          break;
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async () => {
    if (submitting || !validate() || blockUntilRate()) return;
    if (!user?.email) {
      setErrors({ submit: tl("You must be logged in to create invoices") });
      return;
    }
    const naira = (v: number) => toNaira(v) ?? v;
    setSubmitting(true);
    try {
      const created = formatInvoiceDate(invoiceDate);
      await createInvoice({
        invoiceNumber: generateInvoiceNumber(),
        clientId: selectedClientId || undefined,
        clientName: clientName.trim(),
        clientEmail: email.trim(),
        clientPhone: phone.trim(),
        clientAddress: address.trim(),
        status,
        paymentMethod,
        createdDate: invoiceDate || new Date().toISOString(),
        invoiceDate: created,
        dueDate, // YYYY-MM-DD, same as the web
        items: items.map((it) => ({
          itemType: it.itemType,
          category: it.category,
          description: it.description.trim(),
          quantity: num(it.quantity),
          price: naira(num(it.price)),
        })),
        discount: num(discount),
        taxRate: num(taxRate),
        subtotal: naira(totals.subtotal),
        discountAmount: naira(totals.discountAmount),
        taxAmount: naira(totals.taxAmount),
        amount: naira(totals.total),
        amountPaid: naira(totals.paid),
        notes: notes.trim(),
        userEmail: user.email,
      } as any);

      // Sold inventory items come off the stock (same as the web)
      const sold = items.filter((it) => it.itemType === "Item" && it.inventoryItemId);
      for (const it of sold) {
        const stock = stocks.find((s) => s.id === it.inventoryItemId);
        if (!stock) continue;
        const quantity = Math.max(0, (stock.quantity || 0) - num(it.quantity));
        const reorder = stock.reorderPoint ?? stock.minStockLevel ?? 3;
        const nextStatus = quantity <= 0 ? "Out of Stock" : quantity <= reorder ? "Low Stock" : "In Stock";
        await apiFetch(`/inventory/edit/${encodeURIComponent(it.inventoryItemId)}`, {
          method: "PUT",
          body: JSON.stringify({ quantity, status: nextStatus }),
        }).catch((err) => console.warn("Stock update failed:", err?.message ?? err));
      }
      if (sold.length) getInventoryByTailor(user.email);

      ShowToastMessage({ title: tl("Invoice created"), preset: "done", haptic: "success" });
      handleBack();
    } catch (err: any) {
      // the store already showed the error toast
      setErrors({ submit: err?.message || tl("Failed to save invoice. Please try again.") });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => router.replace("/(tabs)/Invoices");

  // ── small building blocks ──
  const inputStyle = [
    Styles.input,
    { paddingVertical: 0, paddingHorizontal: spacing(16), backgroundColor: inputBg, borderColor: inputBorder, color: inputTextColor },
  ];
  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <Text style={[Styles.label, { color: labelColor }]}>
      {tl(text)}
      {required ? <Text style={styles.red}> *</Text> : null}
    </Text>
  );
  const ErrorText = ({ text }: { text?: string }) =>
    text ? <Text style={[Styles.reg12, { color: "red", marginTop: 4 }]}>{text}</Text> : null;
  const SelectBox = ({ value, placeholder, onPress }: { value?: string; placeholder: string; onPress: () => void }) => (
    <Pressable style={[Styles.input, styles.row, { paddingVertical: 0, backgroundColor: inputBg, borderColor: inputBorder }]} onPress={onPress}>
      <Text numberOfLines={1} style={[Styles.reg16, { flex: 1, color: value ? inputTextColor : placeholderColor }]}>
        {value ? tl(value) : tl(placeholder)}
      </Text>
      <ChevronDown size={scale(20)} color={chevronColor} />
    </Pressable>
  );
  const DateBox = ({ value, onPress }: { value: string; onPress: () => void }) => (
    <Pressable style={[styles.datePicker, { borderColor: inputBorder, backgroundColor: inputBg }]} onPress={onPress}>
      <Text style={[styles.reg12, { color: value ? inputTextColor : placeholderColor }]}>
        {value ? GetDetailedDate(value) : "DD/MM/YYYY"}
      </Text>
      <Calendar size={scale(15)} color={chevronColor} />
    </Pressable>
  );
  // Plain function (not a component): inputs inside the card keep focus while typing
  const sectionHead = (title: string, right?: React.ReactNode) => (
    <View style={styles.row}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{tl(title)}</Text>
      {right}
    </View>
  );
  const cardStyle = [styles.card, { backgroundColor: cardBg, borderColor: cardBorder }];

  // ── picker sheet content ──
  const pickerData = (() => {
    if (!picker) return null;
    switch (picker.kind) {
      case "payment":
        return { data: PAYMENT_METHODS.map((v) => ({ value: v, label: v })), selected: paymentMethod, onPick: setPaymentMethod };
      case "status":
        return { data: STATUSES.map((v) => ({ value: v, label: v })), selected: status, onPick: setStatus };
      case "itemType":
        return { data: ITEM_TYPES, selected: items[picker.index]?.itemType ?? "", onPick: (v: string) => setItemType(picker.index, v as ItemType) };
      case "service":
        return {
          data: SERVICE_TYPES.map((v) => ({ value: v, label: v })),
          selected: items[picker.index]?.category ?? "",
          onPick: (v: string) => updateItem(picker.index, { category: v }),
        };
      case "inventory":
        return {
          data: stocks.map((s) => ({
            value: s.id,
            label: `${s.name} - ${tl(s.category)}${(s as any).sku ? ` - ${(s as any).sku}` : ""} (${tl("Stock")}: ${s.quantity ?? 0})`,
          })),
          selected: items[picker.index]?.inventoryItemId ?? "",
          onPick: (v: string) => pickInventoryItem(picker.index, v),
          searchable: true,
        };
    }
  })();

  return (
    <>
      <View style={{ flex: 1, paddingTop: top, backgroundColor: bg }}>
        <StatusBar style={isDark ? "light" : "dark"} />

        <View style={styles.header}>
          <HapticTab style={styles.backBtn} onPress={handleBack}>
            <ChevronLeft size={scale(20)} color={isDark ? "rgba(200,200,200,1)" : "rgba(54, 65, 83, 1)"} strokeWidth={1.5} />
          </HapticTab>
          <Text style={[styles.reg24, { color: textColor }]}>{tl("Create Invoice")}</Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: bg }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? spacing(50) : spacing(0)}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingTop: spacing(16), paddingBottom: spacing(40) }}
            keyboardDismissMode="interactive"
          >
            <View style={styles.content}>
              {/* ── Client details ── */}
              <View style={cardStyle}>
                {sectionHead("Client Details")}
                <View style={Styles.inputContainer}>
                  <Label text="Select Existing Client" />
                  <SelectBox
                    value={selectedClientId ? clients.find((c) => c.id === selectedClientId)?.name : ""}
                    placeholder="Choose a client or enter manually"
                    onPress={() => setClientModal(true)}
                  />
                </View>
                <View style={Styles.inputContainer}>
                  <Label text="Client Name" required />
                  <TextInput
                    value={clientName}
                    onChangeText={(v) => { setClientName(v); if (errors.clientName) setErrors((p) => ({ ...p, clientName: "" })); }}
                    placeholder={tl("Client Name")}
                    placeholderTextColor={placeholderColor}
                    style={inputStyle}
                  />
                  <ErrorText text={errors.clientName} />
                </View>
                <View style={Styles.inputContainer}>
                  <Label text="Email Address" required />
                  <TextInput
                    value={email}
                    onChangeText={(v) => { setEmail(v); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
                    placeholder={tl("Email Address")}
                    placeholderTextColor={placeholderColor}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={inputStyle}
                  />
                  <ErrorText text={errors.email} />
                </View>
                <View style={Styles.inputContainer}>
                  <Label text="Phone Number" />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder={tl("Phone Number")}
                    placeholderTextColor={placeholderColor}
                    keyboardType="phone-pad"
                    style={inputStyle}
                  />
                </View>
                <View style={Styles.inputContainer}>
                  <Label text="Address" />
                  <TextInput
                    value={address}
                    onChangeText={setAddress}
                    placeholder={tl("Address")}
                    placeholderTextColor={placeholderColor}
                    multiline
                    style={[...inputStyle, styles.textArea, { height: 80 }]}
                  />
                </View>
              </View>

              {/* ── Dates ── */}
              <View style={[styles.row, styles.pair]}>
                <View style={[Styles.inputContainer, styles.half]}>
                  <Label text="Invoice Date" />
                  <DateBox value={invoiceDate} onPress={() => setDatePickerFor("invoiceDate")} />
                </View>
                <View style={[Styles.inputContainer, styles.half]}>
                  <Label text="Due Date" required />
                  <DateBox value={dueDate} onPress={() => setDatePickerFor("dueDate")} />
                  <ErrorText text={errors.dueDate} />
                </View>
              </View>

              {/* ── Payment & status ── */}
              <View style={[styles.row, styles.pair]}>
                <View style={[Styles.inputContainer, styles.half]}>
                  <Label text="Payment Method" />
                  <SelectBox value={paymentMethod} placeholder="Select payment method" onPress={() => setPicker({ kind: "payment" })} />
                </View>
                <View style={[Styles.inputContainer, styles.half]}>
                  <Label text="Status" />
                  <SelectBox value={status} placeholder="Select status" onPress={() => setPicker({ kind: "status" })} />
                </View>
              </View>

              {/* ── Items ── */}
              <View style={cardStyle}>
                {sectionHead(
                  "Items",
                  <HapticTab style={styles.addBtn} onPress={addItem}>
                    <Plus size={scale(16)} color="white" />
                    <Text style={[styles.reg14, { color: "white" }]}>{tl("Add Item")}</Text>
                  </HapticTab>,
                )}
                {items.map((item, index) => {
                  const stock = item.inventoryItemId ? stockOf(item.inventoryItemId) : 0;
                  return (
                    <View key={item.key} style={[styles.itemCard, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                      <View style={Styles.inputContainer}>
                        <Label text="Item Type" />
                        <SelectBox
                          value={ITEM_TYPES.find((t) => t.value === item.itemType)?.label}
                          placeholder="Select item type"
                          onPress={() => setPicker({ kind: "itemType", index })}
                        />
                      </View>

                      {item.itemType === "Service" ? (
                        <View style={Styles.inputContainer}>
                          <Label text="Service Type" />
                          <SelectBox value={item.category} placeholder="Select service type" onPress={() => setPicker({ kind: "service", index })} />
                        </View>
                      ) : (
                        <View style={Styles.inputContainer}>
                          <Label text="Select Inventory Item" />
                          <SelectBox
                            value={item.inventoryItemName}
                            placeholder="Choose inventory item"
                            onPress={() => setPicker({ kind: "inventory", index })}
                          />
                          {item.inventoryItemId ? (
                            <View style={styles.stockInfo}>
                              <Text style={[styles.reg12, { color: Colors.primary }]}>
                                📦 {tl("Available Stock:")} {stock} {tl("units")} - {item.inventoryItemName}
                              </Text>
                              {stock <= 3 ? (
                                <Text style={[styles.reg12, { color: "#D97706" }]}>⚠️ {tl("Low stock warning!")}</Text>
                              ) : null}
                            </View>
                          ) : null}
                        </View>
                      )}

                      <View style={Styles.inputContainer}>
                        <Label text="Description" />
                        <TextInput
                          value={item.description}
                          onChangeText={(v) => updateItem(index, { description: v })}
                          placeholder={tl("Description")}
                          placeholderTextColor={placeholderColor}
                          style={inputStyle}
                        />
                      </View>

                      <View style={[styles.row, { gap: spacing(10), alignItems: "flex-start" }]}>
                        <View style={[Styles.inputContainer, { flex: 1 }]}>
                          <Label text="Quantity" />
                          <TextInput
                            value={item.quantity}
                            onChangeText={(v) => updateItem(index, { quantity: v.replace(/[^0-9]/g, "") })}
                            placeholder="1"
                            placeholderTextColor={placeholderColor}
                            keyboardType="number-pad"
                            style={inputStyle}
                          />
                          {item.itemType === "Item" && item.inventoryItemId ? (
                            <Text style={[styles.reg12, { color: labelColor }]}>
                              {tl("Max available:")} {stock}
                            </Text>
                          ) : null}
                        </View>
                        <View style={[Styles.inputContainer, { flex: 1 }]}>
                          <Text style={[Styles.label, { color: labelColor }]}>
                            {tl("Price")} ({symbol})
                          </Text>
                          <TextInput
                            value={item.price}
                            onChangeText={(v) => updateItem(index, { price: v.replace(/[^0-9.]/g, "") })}
                            placeholder={`${symbol}0`}
                            placeholderTextColor={placeholderColor}
                            keyboardType="decimal-pad"
                            style={inputStyle}
                          />
                        </View>
                        <View style={[Styles.inputContainer, { flex: 1 }]}>
                          <Label text="Total" />
                          <View style={[styles.totalBox, { borderColor: inputBorder }]}>
                            <EntryMoney amount={num(item.quantity) * num(item.price)} color={inputTextColor} align="start" />
                          </View>
                        </View>
                      </View>

                      {items.length > 1 ? (
                        <HapticTab style={styles.removeBtn} onPress={() => removeItem(index)}>
                          <Trash2 size={scale(14)} color="#E7000B" />
                          <Text style={[styles.reg14, { color: "#E7000B" }]}>{tl("Remove")}</Text>
                        </HapticTab>
                      ) : null}
                    </View>
                  );
                })}
                <ErrorText text={errors.items} />
              </View>

              {/* ── Amount paid: follows the status ── */}
              <View style={Styles.inputContainer}>
                <Text style={[Styles.label, { color: labelColor }]}>
                  {tl("Amount Paid")} ({symbol})
                  {status === "Partially Paid" ? <Text style={styles.red}> *</Text> : null}
                </Text>
                <TextInput
                  value={
                    status === "Paid"
                      ? String(Number(totals.total.toFixed(2)))
                      : status === "Partially Paid"
                        ? amountPaid
                        : "0"
                  }
                  onChangeText={(v) => {
                    setAmountPaid(v.replace(/[^0-9.]/g, ""));
                    if (errors.amountPaid) setErrors((p) => ({ ...p, amountPaid: "" }));
                  }}
                  editable={status === "Partially Paid"}
                  placeholder={`${symbol}0`}
                  placeholderTextColor={placeholderColor}
                  keyboardType="decimal-pad"
                  style={[...inputStyle, status !== "Partially Paid" && { opacity: 0.6 }]}
                />
                <Text style={[styles.reg12, { color: labelColor }]}>
                  {tl(
                    status === "Paid"
                      ? "Paid in full: the total is filled in."
                      : status === "Partially Paid"
                        ? "Enter how much the client has paid so far."
                        : "Unpaid: nothing paid yet. Change the status to record a payment.",
                  )}
                </Text>
                <ErrorText text={errors.amountPaid} />
              </View>

              {/* ── Discount & tax ── */}
              <View style={[styles.row, styles.pair]}>
                <View style={[Styles.inputContainer, styles.half]}>
                  <Label text="Discount (%)" />
                  <TextInput
                    value={discount}
                    onChangeText={(v) => setDiscount(v.replace(/[^0-9.]/g, ""))}
                    placeholder="0"
                    placeholderTextColor={placeholderColor}
                    keyboardType="decimal-pad"
                    style={inputStyle}
                  />
                </View>
                <View style={[Styles.inputContainer, styles.half]}>
                  <Label text="Tax Rate (%)" />
                  <TextInput
                    value={taxRate}
                    onChangeText={(v) => setTaxRate(v.replace(/[^0-9.]/g, ""))}
                    placeholder="0"
                    placeholderTextColor={placeholderColor}
                    keyboardType="decimal-pad"
                    style={inputStyle}
                  />
                </View>
              </View>

              {/* ── Notes ── */}
              <View style={Styles.inputContainer}>
                <Label text="Notes (Optional)" />
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={tl("Add payment terms, delivery notes, or special instructions...")}
                  placeholderTextColor={placeholderColor}
                  multiline
                  style={[...inputStyle, styles.textArea, { height: 100 }]}
                />
              </View>

              {/* ── Summary ── */}
              <View style={[styles.box, { backgroundColor: summaryBoxBg }]}>
                <View style={styles.row}>
                  <Text style={[Styles.reg14, { color: inputTextColor }]}>{tl("Subtotal")}</Text>
                  <EntryMoney amount={totals.subtotal} color={inputTextColor} align="end" />
                </View>
                {num(discount) > 0 ? (
                  <View style={styles.row}>
                    <Text style={[Styles.reg14, { color: inputTextColor }]}>
                      {tl("Discount")} ({num(discount)}%)
                    </Text>
                    <EntryMoney amount={-totals.discountAmount} color={inputTextColor} align="end" />
                  </View>
                ) : null}
                <View style={styles.row}>
                  <Text style={[Styles.reg14, { color: inputTextColor }]}>
                    {tl("Tax")} ({num(taxRate)}%)
                  </Text>
                  <EntryMoney amount={totals.taxAmount} color={inputTextColor} align="end" />
                </View>
                <View style={[styles.row, { borderTopWidth: 0.5, borderTopColor: summaryDivider, paddingTop: spacing(10) }]}>
                  <Text style={[Styles.reg14, { color: inputTextColor }]}>{tl("Total")}</Text>
                  <EntryMoney amount={totals.total} color={inputTextColor} align="end" />
                </View>
                <View style={styles.row}>
                  <Text style={[Styles.reg14, { color: inputTextColor }]}>{tl("Amount Paid")}</Text>
                  <EntryMoney amount={-totals.paid} color={inputTextColor} align="end" />
                </View>
                <View style={[styles.row, { borderTopWidth: 0.5, borderTopColor: summaryDivider, paddingTop: spacing(10) }]}>
                  <Text style={[Styles.reg14, { color: inputTextColor }]}>{tl("Balance Due")}</Text>
                  <EntryMoney amount={totals.balance} color={Colors.primary} align="end" primarySize={scaleFontSize(24)} />
                </View>
              </View>

              <ErrorText text={errors.submit} />

              <PrimaryButton title={submitting ? "Saving..." : "Create Invoice"} onPress={handleCreate} loading={submitting} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {datePickerFor ? (
        <DatePicker
          modal
          open
          mode="date"
          date={new Date((datePickerFor === "invoiceDate" ? invoiceDate : dueDate) || Date.now())}
          onConfirm={(date) => {
            const value = FormatDateToYYYYMMDD(date.toISOString());
            if (datePickerFor === "invoiceDate") setInvoiceDate(value);
            else {
              setDueDate(value);
              setErrors((p) => ({ ...p, dueDate: "" }));
            }
            setDatePickerFor(null);
          }}
          onCancel={() => setDatePickerFor(null)}
        />
      ) : null}

      {clientModal ? (
        <SelectClientModal visible={clientModal} handleOption={fillClient} onClose={() => setClientModal(false)} />
      ) : null}

      {pickerData ? (
        <SelectFilterModal
          visible
          data={pickerData.data}
          selected={pickerData.selected}
          searchable={"searchable" in pickerData ? pickerData.searchable : false}
          searchPlaceholder={tl("Search")}
          handleOption={(v) => {
            pickerData.onPick(v);
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </>
  );
};

export default CreateInvoiceScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(8),
    paddingHorizontal: spacing(16),
    paddingTop: spacing(12),
    paddingBottom: spacing(8),
  },
  backBtn: { width: 32, aspectRatio: 1, justifyContent: "center", alignItems: "center" },
  reg12: { fontFamily: "regular", fontSize: scaleFontSize(12) },
  reg14: { fontFamily: "regular", fontSize: scaleFontSize(14) },
  reg24: { fontFamily: "regular", fontSize: scaleFontSize(24), lineHeight: 32 },
  sectionTitle: { fontFamily: "semibold", fontSize: scaleFontSize(16) },
  content: { flex: 1, paddingHorizontal: 16, gap: spacing(20) },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pair: { gap: spacing(12), alignItems: "flex-start" },
  half: { flex: 1 },
  card: { borderWidth: 1, borderRadius: 16, padding: spacing(14), gap: spacing(14) },
  itemCard: { borderWidth: 1, borderRadius: 12, padding: spacing(12), gap: spacing(12) },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(4),
    backgroundColor: Colors.primary,
    paddingVertical: spacing(7),
    paddingHorizontal: spacing(12),
    borderRadius: 999,
  },
  removeBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end", gap: spacing(6), paddingVertical: spacing(4) },
  stockInfo: { gap: spacing(2), marginTop: spacing(4) },
  totalBox: { height: 50, borderWidth: 1, borderStyle: "dashed", borderRadius: 10, justifyContent: "center", paddingHorizontal: spacing(8) },
  textArea: { textAlignVertical: "top", paddingTop: spacing(12) },
  red: { color: "rgba(251, 44, 54, 1)" },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing(13),
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
  },
  box: { padding: spacing(16), gap: spacing(10), borderRadius: 16 },
});
