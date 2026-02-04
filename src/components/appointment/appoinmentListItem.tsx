import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { Appointment } from "@/src/types/appointment";
import { GetAmPm, scale, spacing } from "@/src/utils/random";
import { UserRound } from "lucide-react-native";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import ApptStatus from "../shared/ApptStatus";

const getTimeFromISO = (value?: string | Date): string => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) return "";

  return `${date.getHours() % 12 || 12}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = {
  item: Appointment;
};

const AppoinmentListItem: React.FC<Props> = ({ item }) => {
  return (
    <View style={styles.apptView}>
      <View style={[styles.col, { gap: spacing(4) }]}>
        <Text
          style={[Styles.reg12, { color: Colors.text.black, lineHeight: 12 }]}
        >
          {getTimeFromISO(item.time)}
        </Text>
        <Text
          style={[Styles.reg12, { color: Colors.text.black, lineHeight: 12 }]}
        >
          {GetAmPm(item.time)}
        </Text>
      </View>

      <View style={styles.col}>
        <View style={[styles.col, { gap: spacing(4) }]}>
          <View style={[styles.startRow, { gap: spacing(8) }]}>
            <UserRound size={scale(15)} color={Colors.primary} />
            <Text style={[Styles.reg14, { color: Colors.text.black }]}>
              {item.clientName}
            </Text>
          </View>
          <Text style={[Styles.reg12, { color: Colors.text.black }]}>
            {item.type}
          </Text>
        </View>

        <ApptStatus status={item.status} />
      </View>
    </View>
  );
};

export default AppoinmentListItem;

const styles = StyleSheet.create({
  apptView: {
    width: SCREEN_WIDTH - 32 * 5,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: spacing(12),
    backgroundColor: "white",
    elevation: 1,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: "rgba(22, 152, 141, 1)",
    padding: spacing(16),
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(10),
  },
  col: {
    gap: spacing(8),
  },
});
