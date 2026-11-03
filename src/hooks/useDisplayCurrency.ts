import { useEffect, useState } from "react";
import { useUserStore } from "../stores/userSlice";
import { getUsdToNgnRate } from "../utils/exchangeRate";

export type DisplayCurrency = "NGN" | "USD";

export function useDisplayCurrency() {
  const inventoryCurrency = useUserStore((state) => state.brandSetting?.inventoryCurrency);
  const currency: DisplayCurrency = inventoryCurrency === "USD" ? "USD" : "NGN";
  const [usdToNgn, setUsdToNgn] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUsdToNgnRate()
      .then((rate) => {
        if (!cancelled) setUsdToNgn(rate);
      })
      .catch((error) => {
        console.error("Error loading exchange rate:", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toNaira = (value: number) => {
    const amount = Number(value);
    const safe = Number.isFinite(amount) ? amount : 0;
    if (currency !== "USD") return safe;
    if (!usdToNgn) return null;
    return Math.round(safe * usdToNgn * 100) / 100;
  };

  const fromNaira = (stored: number) => {
    const naira = Number(stored);
    if (!Number.isFinite(naira)) return "";
    if (currency === "USD") {
      if (!usdToNgn) return "";
      return (naira / usdToNgn).toFixed(2);
    }
    return String(naira);
  };

  const blockUntilRate = () => {
    if (currency === "USD" && !usdToNgn) {
      const { ShowToastMessage } = require("../utils/random") as typeof import("../utils/random");
      ShowToastMessage({
        title: "Exchange rate is still loading. Try again in a moment.",
        preset: "error",
        haptic: "error",
      });
      return true;
    }
    return false;
  };

  return {
    currency,
    usdToNgn,
    showDollars: currency === "USD" && !!usdToNgn,
    symbol: currency === "USD" ? "$" : "₦",
    toNaira,
    fromNaira,
    blockUntilRate,
  };
}
