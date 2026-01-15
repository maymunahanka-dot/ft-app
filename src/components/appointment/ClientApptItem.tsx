import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { Appointment } from "@/src/types/appointment";
import {
  CapitalizeFirstName,
  GetAmPm,
  scale,
  spacing,
} from "@/src/utils/random";
import { Calendar, Clock, Info, Phone, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  item: Appointment;
};

const ClientApptItem = ({ item }: Props) => {
  const isCompleted = item.status === "completed";
  const isCancelled = item.status === "cancelled";

  const textColor = isCompleted
    ? "rgba(0, 130, 54, 1)"
    : isCancelled
    ? "rgba(193, 0, 7, 1)"
    : "rgba(20, 71, 230, 1)";
  const bgColor = isCompleted
    ? "rgba(220, 252, 231, 1)"
    : isCancelled
    ? "rgba(255, 226, 226, 1)"
    : "rgba(239, 246, 255, 1)";

  return (
    <View style={styles.apptContainer}>
      <View style={[styles.row, { alignItems: "flex-start" }]}>
        <View
          style={[
            styles.gapRow,
            {
              gap: spacing(12),
              justifyContent: "flex-start",
              alignItems: "flex-start",
            },
          ]}
        >
          <View style={styles.iconWrapper}>
            <Calendar size={scale(18)} color={Colors.primary} />
          </View>
          <View style={[styles.col, { gap: spacing(4) }]}>
            <Text style={[Styles.reg14, { color: Colors.text.black }]}>
              {item.type}
            </Text>
            <View
              style={[
                styles.gapRow,
                { justifyContent: "flex-start", gap: spacing(4) },
              ]}
            >
              <User size={scale(12)} color={"rgba(106, 114, 130, 1)"} />
              <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
                {item.clientName}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.badgeView, { backgroundColor: bgColor }]}>
          <Text style={[Styles.reg12, { lineHeight: 16, color: textColor }]}>
            {CapitalizeFirstName(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.clientDetails}>
        <View style={[styles.startRow, { gap: spacing(8) }]}>
          <Clock size={scale(16)} color={Colors.primary} />
          <Text style={[Styles.reg14, { color: Colors.text.black }]}>
            {item.date} at {item.time} {GetAmPm(item.time)}
          </Text>
        </View>

        <View style={[styles.startRow, { gap: spacing(8) }]}>
          <Phone size={scale(16)} color={Colors.primary} />
          <Text style={[Styles.reg14, { color: Colors.text.black }]}>
            {item.clientPhone}
          </Text>
        </View>

        <View style={[styles.startRow, { gap: spacing(8) }]}>
          <Text style={[Styles.med14, { color: Colors.text.black }]}>
            To-do:
          </Text>
          <Text style={[Styles.reg14, { color: Colors.text.black }]}>
            {item.notes ? item.notes : "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.gapRow, { gap: spacing(12) }]}>
          <View style={[styles.gapRow, { gap: spacing(4) }]}>
            <Info size={scale(12)} color={Colors.grey} />
            <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
              24hr reminder
            </Text>
          </View>

          <View style={[styles.gapRow, { gap: spacing(4) }]}>
            <Info size={scale(12)} color={Colors.grey} />
            <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
              1hr reminder
            </Text>
          </View>
        </View>

        <View style={styles.duration}>
          <Text style={[Styles.reg12, { color: "white" }]}>
            Duration: {item.duration} hours
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ClientApptItem;

const styles = StyleSheet.create({
  apptContainer: {
    backgroundColor: "rgba(249, 250, 251, 1)",
    padding: spacing(16),
    borderWidth: 0.3,
    borderColor: "rgba(106, 114, 130, 1)",
    borderRadius: 16,
    gap: spacing(12),
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
  },
  col: {
    gap: spacing(16),
  },
  gapRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing(8),
  },
  iconWrapper: {
    width: 48,
    aspectRatio: 1,
    backgroundColor: "rgba(232, 245, 244, 1)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  badgeView: {
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(8),
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  clientDetails: {
    gap: spacing(8),
  },
  duration: {
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(7),
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
});
