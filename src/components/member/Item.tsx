import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { LoyaltyMember } from "@/src/types/crm";
import {
  CapitalizeFirstName,
  FormatNairaShorthand,
  FormatOrderDate,
  scale,
  spacing,
} from "@/src/utils/random";
import { AntDesign } from "@expo/vector-icons";
import { Award, Crown, Star } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  item: LoyaltyMember;
};

const CrmItem = ({ item }: Props) => {
  const isGold = item.level === "Gold";
  const isPlatinum = item.level === "Platinum";
  // const isSliver = item.level === "Silver";

  const iconColor = isGold
    ? "rgba(166, 95, 0, 1)"
    : isPlatinum
    ? "rgba(130, 0, 219, 1)"
    : "rgba(54, 65, 83, 1)";
  const bgColor = isGold
    ? "rgba(254, 249, 194, 1)"
    : isPlatinum
    ? "rgba(243, 232, 255, 1)"
    : "rgba(229, 231, 235, 1)";

  const Icon = isGold ? Award : isPlatinum ? Crown : Star;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.startRow,
          { gap: spacing(12), alignItems: "flex-start" },
        ]}
      >
        <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
          <Icon size={scale(16)} color={iconColor} />
        </View>
        <View style={styles.content}>
          <Text
            style={[Styles.reg14, { lineHeight: 20, color: Colors.text.black }]}
          >
            {item.name}
          </Text>
          <Text
            style={[Styles.reg12, { lineHeight: 16, color: Colors.text.gray }]}
          >
            {item.email}
          </Text>

          <View style={styles.rowGap}>
            <View style={styles.startRow}>
              <AntDesign
                name="star"
                size={scale(10)}
                color="rgba(240, 177, 0, 1)"
              />
              <Text
                style={[
                  Styles.reg12,
                  { lineHeight: 16, color: Colors.text.gray },
                ]}
              >
                {item.points} pts
              </Text>
            </View>

            <Text
              style={[
                Styles.reg12,
                { lineHeight: 16, color: Colors.text.gray },
              ]}
            >
              •
            </Text>

            <Text
              style={[
                Styles.reg12,
                { lineHeight: 16, color: Colors.text.gray },
              ]}
            >
              {FormatNairaShorthand(item.totalSpent.toString())}
            </Text>
          </View>

          <View
            style={[
              styles.row,
              {
                paddingVertical: spacing(11),
                borderTopColor: "rgba(0, 0, 0, 0.1)",
                borderTopWidth: 0.3,
                flexShrink: 1,
                gap: spacing(25),
              },
            ]}
          >
            <View style={{ gap: spacing(4) }}>
              <Text
                style={[
                  Styles.reg12,
                  { lineHeight: 16, color: Colors.text.gray },
                ]}
              >
                Member Since
              </Text>
              <Text
                style={[
                  Styles.reg14,
                  { lineHeight: 16, color: Colors.text.black },
                ]}
              >
                {FormatOrderDate(item.createdAt.toDate().toDateString(), true)}
              </Text>
            </View>
            <View style={{ gap: spacing(4) }}>
              <Text
                style={[
                  Styles.reg12,
                  { lineHeight: 16, color: Colors.text.gray },
                ]}
              >
                Last Purchase
              </Text>
              <Text
                style={[
                  Styles.reg14,
                  { lineHeight: 16, color: Colors.text.black },
                ]}
              >
                {FormatOrderDate(
                  item.lastActivity.toDate().toDateString(),
                  false
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.badgeView, { backgroundColor: bgColor }]}>
        <Text style={[Styles.reg12, { lineHeight: 16, color: iconColor }]}>
          {CapitalizeFirstName(item.level)}
        </Text>
      </View>
    </View>
  );
};

export default CrmItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "rgba(249, 250, 251, 1)",
    padding: spacing(16),
    gap: spacing(12),
    borderWidth: 0.2,
    borderColor: "rgba(74, 85, 101, 1)",
    borderRadius: 16,
    flexWrap: "wrap",
  },
  iconWrapper: {
    width: 48,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  content: {
    gap: spacing(12),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowGap: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(18),
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(4),
  },
  badgeView: {
    // width: "20%",
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(8),
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
