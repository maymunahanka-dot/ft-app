import { Colors } from "@/src/constants/theme";
import { useInvoiceStore } from "@/src/stores/invoiceSlice";
import { Invoice } from "@/src/types/Invoice";
import {
  FormatCurrency,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router } from "expo-router";
import { Eye, FileText, Pencil, Trash2 } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { HapticTab } from "../haptic-tab";

type Props = {
  invoice: Invoice;
};

const InvoiceItem = ({ invoice }: Props) => {
  const deleteInvoice = useInvoiceStore((state) => state.deleteInvoice);
  const loading = useInvoiceStore((state) => state.loading);

  const handleDeleteInvoice = () => {
    Alert.alert(
      `Delete invoice #${invoice.id.slice(0, 6)}?`,
      "Are you sure you want to delete this invoice? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteInvoice(invoice.id);
            } catch (error) {
              console.error("error deleting invouce", error);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const totalInvoiceAmount = invoice.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  console.log("invoice", JSON.stringify(invoice.id, null, 2));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.startRow, { alignItems: "flex-start" }]}>
          <View style={styles.iconWrapper}>
            <FileText size={scale(18)} color={Colors.primary} />
          </View>

          <View style={{ gap: spacing(5), flexShrink: 1 }}>
            <Text style={styles.reg14}>{invoice.id.slice(0, 8)}</Text>
            <Text style={[styles.reg12, { color: Colors.grey }]}>
              {invoice.invoiceDate}
            </Text>
          </View>
        </View>
        <Text style={styles.reg14}>{FormatCurrency(totalInvoiceAmount)}</Text>
      </View>

      <View style={styles.buttons}>
        <HapticTab
          hitSlop={20}
          style={[styles.btn, { backgroundColor: Colors.inputBorder }]}
          onPress={() => {
            router.replace({
              pathname: "/protected/invoice/[id]",
              params: {
                id: invoice.id,
              },
            });
          }}
        >
          <Pencil size={scale(12)} color={"rgba(74, 85, 101, 1)"} />
          <Text style={[styles.reg14, { color: "black" }]}>Edit</Text>
        </HapticTab>
        <HapticTab
          style={[styles.btn]}
          onPress={() => {
            if (!invoice.id) {
              console.log("invoice id", invoice.id);
              return;
            }
            router.replace({
              pathname: "/protected/invoice-preview",
              params: {
                invoiceId: invoice.id,
              },
            });
          }}
        >
          <Eye size={scale(14)} color={"white"} />
          <Text style={[styles.reg14, { color: "white" }]}>View</Text>
        </HapticTab>

        <HapticTab
          style={[
            styles.btn,
            { backgroundColor: "#FFE2E2", height: 30, borderRadius: 10 },
          ]}
          onPress={handleDeleteInvoice}
        >
          {loading ? (
            <ActivityIndicator size={scale(20)} color={"#E7000B"} />
          ) : (
            <Trash2 size={scale(14)} color={"#E7000B"} strokeWidth={2} />
          )}
        </HapticTab>
      </View>
    </View>
  );
};

export default InvoiceItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    padding: spacing(16),
    gap: spacing(12),
    borderWidth: 0.5,
    borderColor: "#6A7282",
    borderRadius: 16,
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
    gap: spacing(12),
  },
  iconWrapper: {
    width: 40,
    backgroundColor: "#E8F5F4",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  reg14: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: Colors.text.black,
  },
  reg12: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
    color: Colors.text.black,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing(30),
  },
  btn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing(10),
    height: 30,
    backgroundColor: Colors.primary,
    gap: spacing(8),
    borderRadius: 14,
  },
});
