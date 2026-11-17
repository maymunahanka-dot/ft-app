/**
 * App language (English / French).
 *
 * First launch: the phone's language (French phone → French, anything else → English).
 * After sign-up/login: the account's language, which the backend sets from the country
 * (e.g. Chad, Mali, Senegal → French) and the user can change in More → Appearance.
 * The choice is remembered on the phone and saved to the account.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { apiFetch } from "../lib/apiClient";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import phrasesFr from "./locales/phrases.fr.json";

export type AppLanguage = "en" | "fr";
export const LANGUAGES: { code: AppLanguage; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];
const STORAGE_KEY = "ft_language";
/** Set when the person picks a language themselves (sign-in / sign-up switch). */
const CHOSEN_KEY = "ft_language_chosen";

const normalize = (value?: string | null): AppLanguage =>
  String(value || "").toLowerCase().startsWith("fr") ? "fr" : "en";

function deviceLanguage(): AppLanguage {
  try {
    return normalize(getLocales()[0]?.languageCode);
  } catch {
    return "en";
  }
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: deviceLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

// A choice saved on this phone beats the phone's language
AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    if (saved && saved !== i18n.language) i18n.changeLanguage(normalize(saved));
  })
  .catch(() => {});

/**
 * Switch language now and remember it on this phone.
 * `saveToAccount`: also store it on the signed-in account (Settings change).
 */
export async function setAppLanguage(language: string, { saveToAccount = false, chosen = false } = {}) {
  const lng = normalize(language);
  await AsyncStorage.setItem(STORAGE_KEY, lng).catch(() => {});
  if (chosen) await AsyncStorage.setItem(CHOSEN_KEY, lng).catch(() => {});
  if (i18n.language !== lng) await i18n.changeLanguage(lng);
  if (saveToAccount) {
    try {
      await apiFetch("/user/language", { method: "PUT", body: JSON.stringify({ language: lng }) });
    } catch (error: any) {
      console.warn("Could not save language to account:", error?.message ?? error);
    }
  }
}

/**
 * Translate outside React hooks (toasts, alerts, helpers). Components that show
 * text also call useTranslation() so they re-render when the language changes.
 */
export const t = ((...args: Parameters<typeof i18n.t>) => i18n.t(...args)) as typeof i18n.t;

/** Labels kept in lists (options, statuses, categories…), keyed by their English text. */
const PHRASES_FR: Record<string, string> = {
  ...(phrasesFr as Record<string, string>),
  Newest: "Plus récent",
  Oldest: "Plus ancien",
  "Name (A–Z)": "Nom (A–Z)",
  "Name (Z–A)": "Nom (Z–A)",
  Quantity: "Quantité",
  Price: "Prix",
  All: "Tous",
  "Amount (High–Low)": "Montant (décroissant)",
  "Amount (Low–High)": "Montant (croissant)",
  "Due date": "Date d'échéance",
  Date: "Date",
};

/**
 * Translate text at the moment it's shown, by its English wording. Used for labels
 * that live in lists, so the stored values (compared in code / saved) stay English.
 * Returns the text unchanged in English or when there's no translation.
 */
export function tl<T>(text: T): T {
  if (i18n.language !== "fr" || typeof text !== "string") return text;
  return ((PHRASES_FR[text] ?? PHRASES_FR[text.trim()]) as unknown as T) ?? text;
}

/** The language the person picked on this phone before signing in, or null. */
export async function chosenLanguage(): Promise<AppLanguage | null> {
  const v = await AsyncStorage.getItem(CHOSEN_KEY).catch(() => null);
  return v ? normalize(v) : null;
}

/**
 * After sign-in: a language picked on the sign-in / sign-up screen wins and is saved to
 * the account; otherwise the account's language is used. Call once the session is saved.
 */
export async function applyAccountLanguage(accountLanguage?: string | null) {
  const picked = await chosenLanguage();
  await AsyncStorage.removeItem(CHOSEN_KEY).catch(() => {});
  if (picked) {
    await setAppLanguage(picked, { saveToAccount: picked !== normalize(accountLanguage) });
    return picked;
  }
  if (accountLanguage) await setAppLanguage(accountLanguage);
  return accountLanguage ?? null;
}

export default i18n;
