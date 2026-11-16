/**
 * Exchange rates and money formatting.
 *
 * Amounts are always SAVED in Naira. Each business picks a display currency in
 * Brand settings (any ISO code: USD, CNY, GBP, ...). Screens convert Naira to it
 * using live rates from the backend (cached here for 30 minutes).
 */
import { apiFetch } from "../lib/apiClient";

type RatesReply = { success: boolean; usdToNgn?: number; rates?: Record<string, number>; error?: string };

/** Units of each currency per 1 USD. */
let cached: { rates: Record<string, number>; at: number } | null = null;
let pending: Promise<Record<string, number>> | null = null;

/** Same free source the backend uses; only called when the backend doesn't send all rates. */
async function fetchPublicRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    return data?.rates?.NGN ? data.rates : null;
  } catch {
    return null;
  }
}

export async function getRates(): Promise<Record<string, number>> {
  if (cached && Date.now() - cached.at < 30 * 60 * 1000) return cached.rates;
  if (!pending) {
    pending = apiFetch<RatesReply>("/brand-setting/exchange-rate")
      .then(async (data) => {
        if (data.success && data.rates?.NGN) return data.rates;
        // Older backends only send usdToNgn: get the other currencies directly
        const publicRates = await fetchPublicRates();
        if (publicRates) return publicRates;
        if (data.success && data.usdToNgn) return { USD: 1, NGN: Number(data.usdToNgn) };
        throw new Error(data.error || "Exchange rate unavailable");
      })
      .catch(async (error) => {
        // Backend unreachable: try the public source before giving up
        const publicRates = await fetchPublicRates();
        if (publicRates) return publicRates;
        throw error;
      })
      .then((rates) => {
        cached = { rates, at: Date.now() };
        return rates;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

const ngnPerUnitFrom = (rates: Record<string, number> | undefined, currency: string) => {
  if (!currency || currency === "NGN") return 1;
  const ngn = Number(rates?.NGN);
  const unit = Number(rates?.[currency]);
  return ngn && unit ? ngn / unit : null;
};

/** How many Naira one unit of `currency` is worth. 1 for NGN. */
export async function getNgnPerUnit(currency = "NGN"): Promise<number> {
  const rate = ngnPerUnitFrom(await getRates(), currency);
  if (!rate) throw new Error(`No exchange rate for ${currency}`);
  return rate;
}

/** The cached rate without waiting (null if not loaded yet). */
export function peekNgnPerUnit(currency = "NGN") {
  return ngnPerUnitFrom(cached?.rates, currency);
}

export async function getUsdToNgnRate() {
  return getNgnPerUnit("USD");
}

export function peekUsdToNgn() {
  return peekNgnPerUnit("USD");
}

/** Symbols for common currencies (the phone's Intl may not know them all). */
const SYMBOLS: Record<string, string> = {
  NGN: "₦", USD: "$", EUR: "€", GBP: "£", CNY: "¥", JPY: "¥", INR: "₹", GHS: "GH₵", KES: "KSh",
  ZAR: "R", XOF: "CFA", XAF: "FCFA", CAD: "CA$", AUD: "A$", AED: "AED", EGP: "E£", MAD: "MAD",
  UGX: "USh", TZS: "TSh", RWF: "RF", ETB: "Br", BRL: "R$", MXN: "MX$", KRW: "₩", TRY: "₺",
  RUB: "₽", CHF: "CHF", SAR: "SAR", PKR: "Rs", BDT: "৳", PHP: "₱", THB: "฿", VND: "₫",
  IDR: "Rp", MYR: "RM", NZD: "NZ$", SEK: "kr", NOK: "kr", DKK: "kr", PLN: "zł", UAH: "₴",
  ILS: "₪", AFN: "؋", ZMW: "ZK", MWK: "MK", BWP: "P", NAD: "N$", MUR: "₨", LRD: "L$", SLE: "Le", GMD: "D",
};

export function currencySymbol(currency = "NGN") {
  return SYMBOLS[currency] ?? currency;
}

const ZERO_DECIMALS = new Set(["NGN", "JPY", "KRW", "VND", "UGX", "RWF", "XOF", "XAF", "IDR", "CLP"]);

/** "¥230.50", "$12.00", "₦50,000". */
export function formatMoney(amount: number, currency = "NGN") {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;
  const decimals = ZERO_DECIMALS.has(currency) ? 0 : 2;
  const digits = Math.abs(safe)
    .toFixed(decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const symbol = currencySymbol(currency);
  const spaced = symbol.length > 1 && /[A-Za-z]$/.test(symbol) ? `${symbol} ` : symbol;
  return `${safe < 0 ? "-" : ""}${spaced}${digits}`;
}

/** A saved Naira amount shown in another currency. */
export function formatForeign(nairaAmount: number, ngnPerUnit: number, currency: string) {
  const amount = Number(nairaAmount);
  if (!ngnPerUnit || !Number.isFinite(amount)) return "";
  return formatMoney(amount / ngnPerUnit, currency);
}

/** Kept for older callers. */
export function formatDollars(nairaAmount: number, usdToNgn: number) {
  return formatForeign(nairaAmount, usdToNgn, "USD");
}

export function formatNaira(amount: number) {
  return formatMoney(amount, "NGN");
}

/** Currencies offered in the picker (Naira and Dollar first). */
export const CURRENCY_OPTIONS: { code: string; name: string }[] = [
  { code: "NGN", name: "Nigerian Naira" }, { code: "USD", name: "US Dollar" },
  { code: "AED", name: "UAE Dirham" }, { code: "AUD", name: "Australian Dollar" },
  { code: "BDT", name: "Bangladeshi Taka" }, { code: "BRL", name: "Brazilian Real" },
  { code: "BWP", name: "Botswana Pula" }, { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" }, { code: "CNY", name: "Chinese Yuan" },
  { code: "DKK", name: "Danish Krone" }, { code: "EGP", name: "Egyptian Pound" },
  { code: "ETB", name: "Ethiopian Birr" }, { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" }, { code: "GHS", name: "Ghanaian Cedi" },
  { code: "GMD", name: "Gambian Dalasi" }, { code: "IDR", name: "Indonesian Rupiah" },
  { code: "ILS", name: "Israeli Shekel" }, { code: "INR", name: "Indian Rupee" },
  { code: "JPY", name: "Japanese Yen" }, { code: "KES", name: "Kenyan Shilling" },
  { code: "KRW", name: "South Korean Won" }, { code: "LRD", name: "Liberian Dollar" },
  { code: "MAD", name: "Moroccan Dirham" }, { code: "MUR", name: "Mauritian Rupee" },
  { code: "MWK", name: "Malawian Kwacha" }, { code: "MXN", name: "Mexican Peso" },
  { code: "MYR", name: "Malaysian Ringgit" }, { code: "NAD", name: "Namibian Dollar" },
  { code: "NOK", name: "Norwegian Krone" }, { code: "NZD", name: "New Zealand Dollar" },
  { code: "PHP", name: "Philippine Peso" }, { code: "PKR", name: "Pakistani Rupee" },
  { code: "PLN", name: "Polish Zloty" }, { code: "RUB", name: "Russian Ruble" },
  { code: "RWF", name: "Rwandan Franc" }, { code: "SAR", name: "Saudi Riyal" },
  { code: "SEK", name: "Swedish Krona" }, { code: "SLE", name: "Sierra Leonean Leone" },
  { code: "THB", name: "Thai Baht" }, { code: "TRY", name: "Turkish Lira" },
  { code: "TZS", name: "Tanzanian Shilling" }, { code: "UAH", name: "Ukrainian Hryvnia" },
  { code: "UGX", name: "Ugandan Shilling" }, { code: "VND", name: "Vietnamese Dong" },
  { code: "XAF", name: "Central African CFA Franc" }, { code: "XOF", name: "West African CFA Franc" },
  { code: "ZAR", name: "South African Rand" }, { code: "ZMW", name: "Zambian Kwacha" },
];
