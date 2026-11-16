import { useDisplayCurrency } from "@/src/hooks/useDisplayCurrency";
import { formatForeign, formatMoney } from "@/src/utils/exchangeRate";
import { Text } from "react-native";

type MoneyAmountProps = {
  amount: number;
  color?: string;
  /** No longer used (amounts show one currency only); kept so callers don't change. */
  secondaryColor?: string;
  align?: "start" | "end" | "center";
  prefix?: string;
  primarySize?: number;
};

const textAlign = { start: "left", end: "right", center: "center" } as const;

/**
 * A saved (Naira) amount, shown only in the business's Brand currency.
 * Naira businesses see ₦; others see their currency at today's rate.
 */
export default function MoneyAmount({
  amount,
  color,
  align = "start",
  prefix = "",
  primarySize = 14,
}: MoneyAmountProps) {
  const { isForeign, currency, ngnPerUnit, rateFailed } = useDisplayCurrency();
  const text =
    isForeign && ngnPerUnit
      ? formatForeign(amount, ngnPerUnit, currency)
      : isForeign && !rateFailed
        ? "…" // rate still loading: don't flash the wrong currency
        : formatMoney(amount, "NGN"); // Naira business, or no rate available

  return (
    <Text style={{ color, fontFamily: "medium", fontSize: primarySize, textAlign: textAlign[align] }}>
      {prefix}
      {text}
    </Text>
  );
}

/** Amount the user is typing, already in the Brand currency. */
export function EntryMoney(props: MoneyAmountProps) {
  const { currency } = useDisplayCurrency();
  return (
    <Text
      style={{
        color: props.color,
        fontFamily: "medium",
        fontSize: props.primarySize ?? 14,
        textAlign: textAlign[props.align ?? "start"],
      }}
    >
      {`${props.prefix ?? ""}${formatMoney(Number(props.amount) || 0, currency)}`}
    </Text>
  );
}
