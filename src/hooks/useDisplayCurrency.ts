import { useEffect, useState } from "react";
import { useUserStore } from "../stores/userSlice";
import { currencySymbol, getNgnPerUnit, peekNgnPerUnit } from "../utils/exchangeRate";

import { t as tx } from "@/src/i18n";

const normalize = (value?: string) => {
  const code = String(value || "").toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : "NGN";
};

/**
 * The business's display currency (Brand settings) and its rate.
 * `usdToNgn` (name kept for older code) = Naira per 1 unit of the display currency,
 * so `naira / usdToNgn` converts to it and `amount * usdToNgn` converts back.
 * For Naira businesses it's the dollar rate, used for the small "$" hint.
 */
export function useDisplayCurrency() {
  const currency = normalize(useUserStore((state) => state.brandSetting?.inventoryCurrency));
  const isForeign = currency !== "NGN";
  const rateCurrency = isForeign ? currency : "USD";
  const [rate, setRate] = useState<number | null>(() => peekNgnPerUnit(rateCurrency));
  /** True when the rate couldn't be loaded: screens show Naira instead of waiting forever. */
  const [rateFailed, setRateFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getNgnPerUnit(rateCurrency)
      .then((next) => {
        if (!cancelled) {
          setRate(next);
          setRateFailed(false);
        }
      })
      .catch((error) => {
        if (!cancelled) setRateFailed(true);
        console.warn("Exchange rate unavailable, showing Naira:", error?.message ?? error);
      });
    return () => {
      cancelled = true;
    };
  }, [rateCurrency]);

  /** Entered amount (display currency) → Naira to save. null while the rate loads. */
  const toNaira = (value: number) => {
    const amount = Number(value);
    const safe = Number.isFinite(amount) ? amount : 0;
    if (!isForeign) return safe;
    if (!rate) return null;
    return Math.round(safe * rate * 100) / 100;
  };

  /** Saved Naira → display currency, for editing. */
  const fromNaira = (stored: number) => {
    const naira = Number(stored);
    if (!Number.isFinite(naira)) return "";
    if (isForeign) {
      if (!rate) return "";
      return (naira / rate).toFixed(2);
    }
    return String(naira);
  };

  const blockUntilRate = () => {
    if (isForeign && !rate) {
      const { ShowToastMessage } = require("../utils/random") as typeof import("../utils/random");
      ShowToastMessage({
        title: tx("auto.exchangeRateIsStillLoading_c838"),
        preset: "error",
        haptic: "error",
      });
      return true;
    }
    return false;
  };

  return {
    currency,
    isForeign,
    /** Currency of the small secondary line: the display currency, or $ for Naira businesses. */
    secondaryCurrency: rateCurrency,
    usdToNgn: rate,
    ngnPerUnit: rate,
    rateFailed,
    showDollars: isForeign && !!rate, // name kept: true when showing a non-Naira currency
    symbol: currencySymbol(currency),
    toNaira,
    fromNaira,
    blockUntilRate,
  };
}
