import * as WebBrowser from "expo-web-browser";
import { apiFetch } from "./apiClient";

type PayLinkResponse = { success: boolean; data: { url: string; expiresAt: string } };

/**
 * Opens the web pay page for the signed-in user: the backend makes a short-lived
 * link that already knows who is paying, so there is no login on the web. The user
 * picks a plan and pays with Flutterwave there. Resolves when the browser closes,
 * so the caller can refresh the subscription.
 */
export async function openPayPage(): Promise<void> {
  let url: string;
  try {
    ({ data: { url } } = await apiFetch<PayLinkResponse>("/pay-link/create", { method: "POST" }));
  } catch (err) {
    // A non-JSON reply (e.g. a server that doesn't have this route yet) shouldn't show a raw parser error.
    if (err instanceof SyntaxError) throw new Error("Payments aren't available right now. Please try again later.");
    throw err;
  }
  await WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    showTitle: true,
  });
}
