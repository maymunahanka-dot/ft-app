import i18n from "i18next";

/**
 * Locale for showing dates: French dates when the app is in French, otherwise the
 * English format the screen already used (en-US or en-GB). Display only — never
 * use it for dates sent to the backend.
 */
export const dateLocale = (english: "en-US" | "en-GB" = "en-GB") =>
  i18n.language === "fr" ? "fr-FR" : english;
