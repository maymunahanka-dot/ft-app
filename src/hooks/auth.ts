import {
  confirmPasswordReset,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { imageFileField } from "../utils/uploadImage";
import * as FileSystem from "expo-file-system/legacy";
import { auth } from "../context/firebase";
import { apiFetch, clearSession, getStoredToken, getStoredUser, isTokenExpired, saveSession, setUnauthorizedHandler } from "../lib/apiClient";
import { registerFCMToken, removeFCMToken } from "../services/notification.service";
import { useUserStore } from "../stores/userSlice";
import { RegisterUserData } from "../types/auth";
import { ShowToastMessage } from "../utils/random";

import { applyAccountLanguage, chosenLanguage, t as tx } from "@/src/i18n";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const setUserData = useUserStore.getState().updateUser;

  const fetchBrandSettings = useUserStore.getState().fetchBrandSettings;

  // ─── Session restore on app startup ──────────────────────────────────────
  useEffect(() => {
    setUnauthorizedHandler(() => {
      useUserStore.getState().updateUser(null);
    });

    const restoreSession = async () => {
      try {
        const stored = await getStoredUser<RegisterUserData>();
        const token = await getStoredToken();
        if (stored && token && !isTokenExpired(token)) {
          setUserData(stored);
          await fetchBrandSettings();
        } else if (stored || token) {
          await clearSession();
          setUserData(null);
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: RegisterUserData }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        },
      );

      const { token, user } = data;

      await saveSession(token, user);
      await applyAccountLanguage(user?.language);
      setUserData(user);
      await fetchBrandSettings();

      // Register this device for push notifications (fire-and-forget)
      registerFCMToken().catch(() => {});

      return data; // truthy — caller in sign-in.tsx checks `if (result)`
    } catch (error: any) {
      console.error("Error signing in:", error);
      ShowToastMessage({
        title: error.message || tx("auto.errorSigningIn_635f"),
        preset: "error",
        haptic: "error",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    userDataInput: RegisterUserData,
    password: string,
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const userEmail = userDataInput.email.trim().toLowerCase();

      // ── Upload logo to Cloudinary on "Launch Account" ────────────────────
      let logoUrl = "";
      console.log("[SIGNUP] logo value type:", userDataInput.logo ? userDataInput.logo.substring(0, 30) : "none");
      if (userDataInput.logo) {
        if (userDataInput.logo.startsWith("https")) {
          console.log("[SIGNUP] Logo is already a URL, skipping upload");
          logoUrl = userDataInput.logo;
        } else {
          const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
          const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
          console.log("[SIGNUP] Cloudinary cloudName:", cloudName, "preset:", preset);

          let uploadResult: { status: number; body: string };
          if (Platform.OS === "web") {
            // Browser: FileSystem.uploadAsync doesn't exist; post the image with fetch instead
            const logo = userDataInput.logo;
            const source = logo.startsWith("data:") || logo.startsWith("blob:") ? logo : `data:image/jpeg;base64,${logo}`;
            const form = new FormData();
            form.append("file", await imageFileField(source, "logo.jpg", "image/jpeg"));
            form.append("upload_preset", preset!);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
            uploadResult = { status: res.status, body: await res.text() };
          } else {
          // React Native FormData only accepts { uri, type, name } — Blob is not supported.
          // Write base64 / data URI to a temp file first, then use the file:// URI.
          let fileUri = userDataInput.logo;

          if (
            userDataInput.logo.startsWith("data:image") ||
            (!userDataInput.logo.startsWith("file://") && !userDataInput.logo.startsWith("http"))
          ) {
            console.log("[SIGNUP] Converting base64/dataURI to temp file...");
            const base64 = userDataInput.logo.startsWith("data:image")
              ? userDataInput.logo.split(",")[1]
              : userDataInput.logo;
            const tempUri = `${FileSystem.cacheDirectory}logo_upload.jpg`;
            console.log("[SIGNUP] Writing to temp URI:", tempUri);
            await FileSystem.writeAsStringAsync(tempUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            fileUri = tempUri;
            console.log("[SIGNUP] Temp file written ✅ fileUri:", fileUri);
          } else {
            console.log("[SIGNUP] Logo is already a file URI:", fileUri.substring(0, 40));
          }

          console.log("[SIGNUP] Uploading logo to Cloudinary via FileSystem.uploadAsync...");
          uploadResult = await FileSystem.uploadAsync(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            fileUri,
            {
              httpMethod: "POST",
              uploadType: 1,
              fieldName: "file",
              mimeType: "image/jpeg",
              parameters: { upload_preset: preset! },
            },
          );
          }
          console.log("[SIGNUP] Cloudinary upload status:", uploadResult.status, uploadResult.body?.substring(0, 100));

          const cloudData = JSON.parse(uploadResult.body);
          if (uploadResult.status < 200 || uploadResult.status >= 300 || !cloudData.secure_url) {
            console.error("[SIGNUP] Cloudinary upload failed:", uploadResult.body);
            ShowToastMessage({ title: tx("auto.logoUploadFailedPleaseTry_95e2"), preset: "error", haptic: "error" });
            return false;
          }
          logoUrl = cloudData.secure_url;
          console.log("[SIGNUP] Logo uploaded ✅:", logoUrl);
        }
      }

      // ── POST as JSON via apiFetch (same path as login — already proven to work) ──
      console.log("[SIGNUP] Posting to backend:", userEmail);
      console.log("[SIGNUP] Full URL:", `${process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://backend.fashiontally.com/api"}/auth/signup`);
      let data: any;
      try {
        data = await apiFetch<any>("/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            name: userDataInput.name.trim(),
            email: userEmail,
            phone: userDataInput.phone.trim(),
            password,
            country: (userDataInput.country ?? "Nigeria").trim(),
            // language picked on the sign-up screen beats the country default
            language: (await chosenLanguage()) ?? undefined,
            businessName: userDataInput.businessName.trim(),
            category: (userDataInput.role ?? "Designer").trim(),
            logoUrl,
            emailVerificationToken: userDataInput.emailVerificationToken,
          }),
        });
      } catch (fetchErr: any) {
        // apiFetch throws on !ok — extract message from the error
        console.error("[SIGNUP] Backend error:", fetchErr?.message);
        ShowToastMessage({ title: fetchErr?.message ?? tx("auto.signUpFailed_a7bd"), preset: "error", haptic: "error" });
        return false;
      }

      console.log("[SIGNUP] Response body:", JSON.stringify(data, null, 2));

      // ── Auto-login to get the JWT ─────────────────────────────────────────
      const loginData = await apiFetch<{ token: string; user: RegisterUserData }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email: userEmail, password }),
        },
      );

      await saveSession(loginData.token, loginData.user);
      await applyAccountLanguage(loginData.user?.language);
      setUserData(loginData.user);
      await fetchBrandSettings();

      return true;
    } catch (error: any) {
      console.error("[SIGNUP] Unexpected error:", error?.message ?? error);
      ShowToastMessage({
        title: tx("auto.errorSigningUp_003c"),
        message: error.message,
        preset: "error",
        haptic: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Remove this device's FCM token before clearing session
      await removeFCMToken().catch(() => {});
      await clearSession();
      setUserData(null);
      // Also sign out of Firebase so legacy Firestore paths don't retain a stale session
      try { await auth.signOut(); } catch { /* ignore */ }
    } catch (error: any) {
      console.error("Error signing out:", error);
      ShowToastMessage({
        title: tx("auto.errorSigningOut_36d6"),
        preset: "error",
        haptic: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendResetEmail = async (email: string) => {
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      Alert.alert(
        tx("auto.emailSent_9b39"),
        tx("auto.aPasswordResetLinkHas_0a08"),
        [{ text: "OK" }],
      );
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      ShowToastMessage({
        title: error.message || tx("auto.errorSendingResetEmail_e944"),
        preset: "error",
        haptic: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const confrimResetCode = async (otp: string, newPassword: string) => {
    setLoading(true);
    try {
      await confirmPasswordReset(auth, otp, newPassword);
    } catch (error) {
      console.error("Error sending reset password:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      // Re-read the current user from the store and reload brand settings
      const currentUser = useUserStore.getState().user;
      if (!currentUser) return;
      setUserData(currentUser);
      await fetchBrandSettings();
    } catch (error: any) {
      console.error("Error refreshing user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    refreshUser,
    signIn,
    signOut,
    signUp,
    sendResetEmail,
    confrimResetCode,
  };
}
