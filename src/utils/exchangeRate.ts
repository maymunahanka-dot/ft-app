import { apiFetch } from "../lib/apiClient";

let cachedRate: { rate: number; at: number } | null = null;

export function peekUsdToNgn() {
  return cachedRate?.rate ?? null;
}

export async function getUsdToNgnRate() {
  if (cachedRate && Date.now() - cachedRate.at < 30 * 60 * 1000) {
    return cachedRate.rate;
  }

  const data = await apiFetch<{ success: boolean; usdToNgn?: number; error?: string }>(
    "/brand-setting/exchange-rate",
  );
  if (!data.success || !data.usdToNgn) {
    throw new Error(data.error || "Exchange rate unavailable");
  }

  cachedRate = { rate: Number(data.usdToNgn), at: Date.now() };
  return cachedRate.rate;
}

export function formatDollars(nairaAmount: number, usdToNgn: number) {
  const amount = Number(nairaAmount);
  if (!usdToNgn || !Number.isFinite(amount)) return "";
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${(Math.abs(amount) / usdToNgn).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNaira(amount: number) {
  const value = Number(amount) || 0;
  const sign = value < 0 ? "-" : "";
  return `${sign}₦${Math.abs(value).toLocaleString()}`;
}
