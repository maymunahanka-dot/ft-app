import BurgerIcon from "@/src/components/drawer/BurgerIcon";
import InvoiceItem from "@/src/components/invoice/Item";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { getCurrentUserEmail } from "@/src/lib/auth-utils";
import { useInvoiceStore } from "@/src/stores/invoiceSlice";
import { Invoice } from "@/src/types/Invoice";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Plus, Search } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InvoicesScreen = () => {
  const [searchValue, setSearchValue] = useState("");

  const invoices = useInvoiceStore((state) => state.invoices);
  const loading = useInvoiceStore((state) => state.loading);
  const fetchInvoices = useInvoiceStore((state) => state.getInvoicesByTailor);

  useEffect(() => {
    fetchInvoices(getCurrentUserEmail());
  }, []);

  const filteredListData = useMemo(() => {
    if (!searchValue || !searchValue.trim()) return invoices;

    const q = searchValue.toLowerCase();
    return invoices.filter((c: Invoice) => {
      const billTo = String(c?.billTo ?? "").toLowerCase();
      return billTo.includes(q);
    });
  }, [searchValue, invoices]);

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <BurgerIcon
          title="Invoices"
          textStyle={{
            fontFamily: "medium",
            fontSize: scaleFontSize(25),
            lineHeight: 30,
          }}
          viewStyle={{ paddingHorizontal: 20, marginTop: spacing(20) }}
        />
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
              placeholder={"Search by bill to details..."}
              placeholderTextColor={Colors.grey}
              style={styles.input}
            />
          </View>

          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size={"small"} color={"black"} />
            </View>
          ) : (
            <FlatList
              data={filteredListData}
              keyExtractor={(item) => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={{
                flexGrow: 1,
                gap: spacing(16),
                paddingTop: spacing(20),
                paddingBottom: spacing(40),
              }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <InvoiceItem invoice={item} />}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text
                    style={[Styles.med12, { color: Colors.text.gray }]}
                  >{`No invoice found.`}</Text>
                </View>
              )}
            />
          )}
        </View>

        <Pressable
          style={styles.floatingBtn}
          onPress={() => router.replace("/protected/form/create-invoice")}
        >
          <Plus size={scale(20)} color={"white"} />
        </Pressable>
      </SafeAreaView>
    </>
  );
};

export default InvoicesScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: spacing(30),
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(4),
  },
  searchContainer: {
    backgroundColor: "rgba(249, 250, 251, 1)",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 1)",
    borderRadius: 14,
    paddingVertical: spacing(5),
    paddingHorizontal: spacing(16),
  },
  input: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingBtn: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 16,
    bottom: 30,
    elevation: 3,
  },
});
