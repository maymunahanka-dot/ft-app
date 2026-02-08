import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { Client } from "@/src/types/client";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import { ChevronRight, Mail, Phone } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: Client;
};

const ClientItem = ({ item }: Props) => {
  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        router.replace({
          pathname: "/protected/client/[id]",
          params: {
            id: item.id,
          },
        });
      }}
    >
      <View style={styles.row}>
        <View style={styles.details}>
          <View style={styles.gapRow}>
            <View style={styles.dot} />
            <Text style={styles.reg18}>{item.name}</Text>
          </View>

          <View style={{ gap: spacing(8) }}>
            <View style={styles.gapRow}>
              <Phone size={scale(16)} color={Colors.grey} />
              <Text
                style={[Styles.reg14, { lineHeight: 20, color: Colors.grey }]}
              >
                {item.phone}
              </Text>
            </View>

            <View style={styles.gapRow}>
              <Mail size={scale(16)} color={Colors.grey} />
              <Text
                style={[Styles.reg14, { lineHeight: 20, color: Colors.grey }]}
              >
                {item.email}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.gapRow, { gap: spacing(20) }]}>
          {/* <Text style={[Styles.reg12, { lineHeight: 16, color: Colors.grey }]}>
            Last order:{"\n"} */}
          {/* {item?.lastVisit || item.updatedAt} */}
          {/* {FormatOrderDate(
              item?.lastVisit
                ? item.lastVisit
                : (item?.updatedAt ?? new Date().toISOString()),
              true,
            )} */}
          {/* </Text> */}

          <ChevronRight size={scale(18)} color={Colors.iconGrey} />
        </View>
      </View>
    </Pressable>
  );
};

export default ClientItem;

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing(17),
    paddingHorizontal: spacing(25),
    borderWidth: 1.1,
    borderColor: "rgba(229, 231, 235, 1)",
    borderRadius: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  details: {
    gap: spacing(12),
    flexShrink: 1,
  },
  gapRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(12),
  },
  dot: {
    width: 8,
    aspectRatio: 1,
    borderRadius: 100,
    backgroundColor: Colors.primary,
  },
  reg18: {
    fontFamily: "regular",
    fontSize: scaleFontSize(18),
    lineHeight: 28,
    color: Colors.text.black,
  },
});
