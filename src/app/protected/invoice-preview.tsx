import InvoicePreviewScreen from "@/src/components/invoice/InvoicePreviewScreen";
import { useInvoiceStore } from "@/src/stores/invoiceSlice";
import { spacing } from "@/src/utils/random";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

// const invoice = {
//     invoiceNumber: "INV-000272",
//     invoiceDate: "19 Dec 2025",
//     dueDate: "19 Dec 2025",
//     terms: "Due on Receipt",
//     businessName: "Malaabis by Maymz Couture",
//     businessAddress: "No 1b Ahmadu Bello Way Nassarawa GRA, Kano, Nigeria",
//     logoUrl: "https://picsum.photos/200",
//     billTo: "Hajiya Sahura",
//     currency: "NGN",
//     items: [
//       { name: "Malaabis bespoke classy boubou", qty: 2, rate: 70000 },
//       { name: "Beaded gown", qty: 1, rate: 80000 },
//     ],
//     notes: ["MalaabisbyMaymz Couture LTD", "Zenith Bank - 1015057791"],
//     termsAndConditions: "NO REFUND AFTER PAYMENT",
//   };

const InvoicePreview = () => {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();

  const invoices = useInvoiceStore((state) => state.invoices);
  const invoice = invoices.find((prev) => prev.id === invoiceId.toString())!;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: spacing(20) }}>
      <InvoicePreviewScreen invoice={invoice} />
    </SafeAreaView>
  );
};

export default InvoicePreview;

// const styles = StyleSheet.create({});
