/**
 * src/services/notification.service.ts
 *
 * Push notifications:
 *   Android → native FCM token, sent by Firebase Admin
 *   iOS     → raw APNs token, sent by the backend directly to Apple
 *
 * An ExponentPushToken is not accepted.
 *
 * Remote push requires a development or store build, not Expo Go.
 * Functions fail quietly in Expo Go.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Linking, Platform } from "react-native";
import { apiFetch } from "../lib/apiClient";

export const FCM_TOKEN_KEY        = "fcmDeviceToken";
// Tracks the enabled state locally so the screen can read it without a backend call
const FCM_ENABLED_KEY             = "fcmNotificationsEnabled";
// Tracks whether we already prompted this login session
export const NOTIFICATION_PROMPTED_KEY = "notificationPromptedAt";

// ── Detect if we are in Expo Go ───────────────────────────────────────────────
const isExpoGo = Constants.appOwnership === "expo";

// ── Lazy-load expo-notifications so Expo Go doesn't crash on import ───────────
let Notifications: typeof import("expo-notifications") | null = null;
let Device: typeof import("expo-device") | null = null;

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    Device        = require("expo-device");

    // Configure foreground notification behaviour
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList:  true,
      }),
    });
  } catch (err: any) {
    console.warn("[FCM] expo-notifications not available:", err.message);
  }
} else {
  console.warn("[FCM] Running in Expo Go — push notifications disabled. Use a development build.");
}

type MessagingModule = typeof import("@react-native-firebase/messaging");

let messagingModule: MessagingModule | null = null;
let messagingListenersReady = false;

function loadMessaging(): MessagingModule | null {
  if (messagingModule) return messagingModule;
  try {
    messagingModule = require("@react-native-firebase/messaging");
    return messagingModule;
  } catch (err: any) {
    console.warn("[FCM] Firebase messaging unavailable:", err.message);
    return null;
  }
}

async function showForegroundNotification(title: string, body: string, data?: Record<string, unknown>) {
  if (!Notifications || (!title && !body)) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: "default",
    },
    trigger: null,
  });
}

function startFirebaseListeners() {
  if (messagingListenersReady || isExpoGo) return;
  const messaging = loadMessaging();
  if (!messaging) return;

  try {
    const instance = messaging.getMessaging();
    messaging.onMessage(instance, async (remoteMessage) => {
      const title = remoteMessage.notification?.title ?? "";
      const body = remoteMessage.notification?.body ?? "";
      await showForegroundNotification(title, body, remoteMessage.data);
    });
    messaging.onTokenRefresh(instance, async (nextToken) => {
      if (!nextToken) return;
      await AsyncStorage.setItem(FCM_TOKEN_KEY, nextToken);
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) return;
      const platform = Platform.OS === "ios" ? "ios" : "android";
      const deviceName = `${Device?.modelName ?? "Mobile"} / ${platform}`;
      await apiFetch("/user/fcm-token", {
        method: "PUT",
        body: JSON.stringify({ token: nextToken, platform, deviceName }),
      });
    });
    messagingListenersReady = true;
  } catch (err: any) {
    console.warn("[FCM] Could not start Firebase listeners:", err.message);
  }
}

function normalizeApnsToken(raw: string): string {
  return raw.replace(/[<>\s]/g, "");
}

if (!isExpoGo && Platform.OS === "android") {
  startFirebaseListeners();
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check the current OS permission status without prompting.
 * Returns: "granted" | "denied" | "undetermined" | "unavailable"
 */
export const getPermissionStatus = async (): Promise<"granted" | "denied" | "undetermined" | "unavailable"> => {
  if (isExpoGo || !Notifications) return "unavailable";
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status as "granted" | "denied" | "undetermined";
  } catch {
    return "unavailable";
  }
};

/**
 * Request permission, get an FCM token, and register it with the backend.
 * iOS exchanges the APNs token for an FCM token. Android already receives one.
 * Returns the token on success, null on any failure.
 */
export const registerFCMToken = async (): Promise<string | null> => {
  if (isExpoGo || !Notifications || !Device) {
    console.warn("[FCM] Skipping token registration — development build required.");
    return null;
  }

  try {
    // Push notifications require a physical device
    if (!Device.isDevice) {
      console.warn("[FCM] Push notifications require a physical device, not a simulator.");
      return null;
    }

    // ── 1. Check / request permission ────────────────────────
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("[FCM] Notification permission not granted:", finalStatus);
      // Clear local enabled flag so UI reflects real state
      await AsyncStorage.removeItem(FCM_ENABLED_KEY);
      return null;
    }

    // ── 2. Android notification channel ──────────────────────
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name:             "FashionTally",
        importance:       Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor:       "#16988D",
        sound:            "default",
      });
    }

    if (Platform.OS === "android") startFirebaseListeners();

    const tokenData = await Notifications.getDevicePushTokenAsync();
    let token = typeof tokenData.data === "string" ? tokenData.data : "";
    if (Platform.OS === "ios") token = normalizeApnsToken(token);

    if (!token || token.startsWith("ExponentPushToken")) {
      console.warn("[FCM] Did not receive a native push token.");
      return null;
    }
    console.log("[FCM] ✅ Push token received:", token.slice(0, 40) + "...");

    const previous = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (previous && previous !== token) {
      await apiFetch("/user/fcm-token", {
        method: "DELETE",
        body: JSON.stringify({ token: previous }),
      }).catch(() => {});
    }

    // ── 4. Save token + enabled flag locally ─────────────────
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    await AsyncStorage.setItem(FCM_ENABLED_KEY, "true");

    // ── 5. Register with backend ──────────────────────────────
    const platform   = Platform.OS === "ios" ? "ios" : "android";
    const deviceName = `${Device.modelName ?? "Mobile"} / ${platform}`;

    await apiFetch("/user/fcm-token", {
      method: "PUT",
      body:   JSON.stringify({ token, platform, deviceName }),
    });

    // Also ensure enabled=true on backend in case it was previously disabled
    await apiFetch("/user/notifications/toggle", {
      method: "PUT",
      body:   JSON.stringify({ token, enabled: true }),
    });

    console.log("[FCM] ✅ Device registered and enabled on backend");
    return token;

  } catch (error: any) {
    console.error("[FCM] ❌ Error registering token:", error.message);
    return null;
  }
};

/**
 * Remove this device's token from the backend (call on logout).
 * Also clears the local enabled flag and prompt history so
 * the prompt re-appears on the next login.
 */
export const removeFCMToken = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (token) {
      await apiFetch("/user/fcm-token", {
        method: "DELETE",
        body:   JSON.stringify({ token }),
      });
    }

    // Always clear local state regardless of API result
    await AsyncStorage.multiRemove([
      FCM_TOKEN_KEY,
      FCM_ENABLED_KEY,
      NOTIFICATION_PROMPTED_KEY, // reset so prompt shows on next login
    ]);

    console.log("[FCM] ✅ Device token removed, prompt state reset");
  } catch (error: any) {
    console.error("[FCM] ❌ Error removing token:", error.message);
  }
};

/**
 * Toggle push notifications on/off for this specific device.
 *
 * ON:  calls registerFCMToken() which handles permission + registration
 * OFF: sets enabled=false on backend, removes local token + enabled flag
 */
export const toggleDeviceNotification = async (enabled: boolean): Promise<boolean> => {
  try {
    if (enabled) {
      // Full registration flow handles permission + token + backend
      const token = await registerFCMToken();
      return !!token;
    }

    // Turning OFF
    const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (!token) {
      console.warn("[FCM] No local token — nothing to disable");
      return true; // Already off, not an error
    }

    await apiFetch("/user/notifications/toggle", {
      method: "PUT",
      body:   JSON.stringify({ token, enabled: false }),
    });

    // Clear local enabled flag (keep token so we can re-enable later)
    await AsyncStorage.setItem(FCM_ENABLED_KEY, "false");

    console.log("[FCM] Notifications disabled for this device");
    return true;

  } catch (error: any) {
    console.error("[FCM] ❌ Error toggling notifications:", error.message);
    return false;
  }
};

/**
 * Get the current notification enabled state.
 * Source of truth priority:
 *   1. OS permission (if denied → definitely off)
 *   2. Local AsyncStorage enabled flag
 *   3. Falls back to whether a token exists
 */
export const getNotificationEnabled = async (): Promise<boolean> => {
  if (isExpoGo || !Notifications) return false;

  try {
    // If OS permission is denied, it's definitely off
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "denied") {
      // Clean up stale local state
      await AsyncStorage.setItem(FCM_ENABLED_KEY, "false");
      return false;
    }

    // Read local enabled flag
    const enabledFlag = await AsyncStorage.getItem(FCM_ENABLED_KEY);
    if (enabledFlag !== null) {
      return enabledFlag === "true";
    }

    // Fallback: if token exists and permission granted, assume enabled
    const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    return !!token && status === "granted";

  } catch {
    return false;
  }
};

/**
 * Open system notification settings for this app.
 * Use when permission is "denied" and user needs to manually enable.
 */
export const openNotificationSettings = async (): Promise<void> => {
  try {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    } else {
      // Try expo-intent-launcher first, fall back to Linking
      try {
        const IntentLauncher = require("expo-intent-launcher");
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.APP_NOTIFICATION_SETTINGS,
          { data: "package:com.fashion.fashiontally" }
        );
      } catch {
        await Linking.openSettings();
      }
    }
  } catch (error: any) {
    console.error("[FCM] ❌ Could not open settings:", error.message);
  }
};

/**
 * Read the locally stored FCM token (no API calls).
 */
export const getStoredFCMToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(FCM_TOKEN_KEY);
};

/**
 * Returns true if push notifications are available in this runtime.
 */
export const isPushAvailable = (): boolean => !isExpoGo && !!Notifications;
