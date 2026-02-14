import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { getCurrentUserEmail, getCurrentUserId } from "../lib/auth-utils";
import { BrandSettings, RegisterUserData } from "../types/auth";
import { sanitizeBrandSettings, ShowToastMessage } from "../utils/random";
interface UserState {
  loading: boolean;
  user: RegisterUserData | null;
  brandSetting: BrandSettings | null;
  updateUser: (user: RegisterUserData | null) => void;
  updateUserDetails: (user: RegisterUserData) => Promise<boolean>;
  fetchBrandSettings: () => Promise<void>;
  editBrandSettings(updates: Partial<BrandSettings>): Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  loading: false,
  user: null,
  brandSetting: null,
  updateUser(user) {
    set({ user });
  },
  async updateUserDetails(user) {
    set({ loading: true });

    console.log("user updating", user);

    try {
      const uid = getCurrentUserId();
      const email = user.email;

      let userRef = doc(db, "fashiontally_users", uid);

      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        console.log("UID doc missing, trying email fallback...");

        const q = query(
          collection(db, "fashiontally_users"),
          where("email", "==", email),
        );

        const result = await getDocs(q);

        if (!result.empty) {
          userRef = result.docs[0].ref;
          console.log("Found legacy user doc:", userRef.id);
        }
      }

      await setDoc(userRef, user, { merge: true });

      set({ user });

      return true;
    } catch (error) {
      console.error("error updating profile", error);

      ShowToastMessage({
        title: "Error updating profile",
        preset: "error",
        haptic: "error",
      });

      return false;
    } finally {
      set({ loading: false });
    }
  },

  async fetchBrandSettings() {
    set({ loading: true });

    try {
      const userEmail = getCurrentUserEmail();
      if (!userEmail) return;

      const settingsRef = doc(db, "fashiontally_brand_settings", userEmail);

      const snap = await getDoc(settingsRef);

      if (snap.exists()) {
        set({ brandSetting: snap.data() as BrandSettings });
      } else {
        set({ brandSetting: null });
      }
    } catch (error: any) {
      console.error("Error fetching brand settings:", error);
      ShowToastMessage({
        title: "Failed to load brand settings",
        message: error.message,
        preset: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async editBrandSettings(updates: BrandSettings) {
    set({ loading: true });

    try {
      const docId = (updates.userEmail ?? "").trim();
      if (!docId) {
        ShowToastMessage({
          title: "Update failed",
          message: "Missing user email (document id).",
          preset: "error",
          haptic: "error",
        });
        return false;
      }

      const settingsRef = doc(db, "fashiontally_brand_settings", docId);

      const updateData: BrandSettings = sanitizeBrandSettings({
        ...updates,
        updatedAt: new Date().toISOString(),
        userEmail: docId,
      });

      await setDoc(settingsRef, updateData, { merge: true });

      set({ brandSetting: updateData });

      ShowToastMessage({
        title: "Settings saved",
        preset: "done",
        haptic: "success",
      });

      return true;
    } catch (error: any) {
      console.error("Error updating brand settings:", error);
      ShowToastMessage({
        title: "Update failed",
        message: error.message,
        preset: "error",
        haptic: "error",
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
