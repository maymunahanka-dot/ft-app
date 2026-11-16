import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { Appointment } from "@/src/types/appointment";
import { spacing } from "@/src/utils/random";
import { FlatList, StyleSheet, Text, View } from "react-native";
import ClientApptItem from "./ClientApptItem";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";

type Props = {
  apptList: Appointment[];
};

const ClientApptList = ({ apptList }: Props) => {
  const { t: tx } = useTranslation();
  return (
    <FlatList
      data={apptList}
      renderItem={({ item }) => <ClientApptItem item={item} />}
      keyExtractor={(item) => item.id}
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        gap: spacing(16),
        paddingBottom: spacing(40),
      }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text
            style={[Styles.med12, { color: Colors.text.gray }]}
          >{tx("auto.noAppointmentFoundForThis_0a1b")}</Text>
        </View>
      )}
    />
  );
};

export default ClientApptList;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
