import { useDisplayCurrency } from "@/src/hooks/useDisplayCurrency";
import React from "react";
import { Text, View } from "react-native";

function nairaText(amount: number) {
  const value = Number(amount) || 0;
  const sign = value < 0 ? "-" : "";
  const digits = Math.abs(value).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}₦${digits}`;
}

function dollarText(amount: number, usdToNgn: number) {
  const value = Number(amount) || 0;
  const sign = value < 0 ? "-" : "";
  const dollars = Math.abs(value) / usdToNgn;
  const digits = dollars.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${digits}`;
}

type MoneyAmountProps = {
  amount: number;
  color?: string;
  secondaryColor?: string;
  align?: "start" | "end" | "center";
  prefix?: string;
  primarySize?: number;
};

const alignItems = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
} as const;

export default function MoneyAmount({
  amount,
  color,
  secondaryColor,
  align = "start",
  prefix = "",
  primarySize = 14,
}: MoneyAmountProps) {
  const { showDollars, usdToNgn } = useDisplayCurrency();
  const naira = `${prefix}${nairaText(amount)}`;

  if (!usdToNgn) {
    return (
      <Text style={{ color, fontFamily: "medium", fontSize: primarySize }}>{naira}</Text>
    );
  }

  const dollars = `${prefix}${dollarText(amount, usdToNgn)}`;

  return (
    <View style={{ alignItems: alignItems[align] }}>
      <Text style={{ color, fontFamily: "medium", fontSize: primarySize }}>
        {showDollars ? dollars : naira}
      </Text>
      <Text style={{ color: secondaryColor ?? color, opacity: secondaryColor ? 1 : 0.65, fontFamily: "regular", fontSize: 11 }}>
        {showDollars ? naira : dollars}
      </Text>
    </View>
  );
}

/** Amount the user is typing, already in the selected currency. */
export function EntryMoney(props: MoneyAmountProps) {
  const { currency, usdToNgn } = useDisplayCurrency();
  const entered = Number(props.amount) || 0;

  if (currency === "USD" && !usdToNgn) {
    return (
      <Text style={{ color: props.color, fontFamily: "medium", fontSize: props.primarySize ?? 14 }}>
        {`${props.prefix ?? ""}$${entered.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </Text>
    );
  }

  const naira = currency === "USD" && usdToNgn ? Math.round(entered * usdToNgn * 100) / 100 : entered;
  return <MoneyAmount {...props} amount={naira} />;
}
