import ClientItem from "@/src/components/clients/Item";
import BurgerIcon from "@/src/components/drawer/BurgerIcon";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useClientStore } from "@/src/stores/clientSlice";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Plus, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";
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

const ClientsScreen = () => {
  const [searchValue, setSearchValue] = useState("");

  const loading = useClientStore((state) => state.loading);
  const clients = useClientStore((state) => state.clients);

  const filteredListData = useMemo(() => {
    if (!searchValue || !searchValue.trim()) return clients;

    const q = searchValue.toLowerCase();
    return clients.filter((c: any) => {
      const name = String(c?.name ?? "").toLowerCase();
      const phone = String(c?.phone ?? "").toLowerCase();
      const email = String(c?.email ?? "").toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q);
    });
  }, [searchValue, clients]);

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <BurgerIcon
          title="Clients"
          textStyle={{
            fontFamily: "medium",
            fontSize: scaleFontSize(25),
            lineHeight: 30,
          }}
          viewStyle={{ paddingHorizontal: 20, marginVertical: spacing(20) }}
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
              placeholder={"Search clients by name, phone, or email"}
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
              // scrollEnabled={false}
              renderItem={({ item }) => <ClientItem item={item} />}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text
                    style={[Styles.med12, { color: Colors.text.gray }]}
                  >{`No client found.`}</Text>
                </View>
              )}
            />
          )}
        </View>

        <Pressable
          style={styles.floatingBtn}
          onPress={() => router.replace("/protected/form/create-client")}
        >
          <Plus size={scale(20)} color={"white"} />
        </Pressable>
      </SafeAreaView>
    </>
  );
};

export default ClientsScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: spacing(20),
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
    paddingVertical: spacing(12),
    paddingHorizontal: spacing(16),
  },
  input: {
    flex: 1,
    // backgroundColor: "red",
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
