import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { getCurrentUserEmail, getCurrentUserId } from "../lib/auth-utils";
import { BrandSettings, RegisterUserData } from "../types/auth";
import { ShowToastMessage } from "../utils/random";

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

  async editBrandSettings(updates) {
    const currentSettings = get().brandSetting;

    if (!currentSettings?.userEmail) {
      ShowToastMessage({
        title: "No settings found",
        message: "Please create brand settings first.",
        preset: "error",
      });
      return false;
    }

    set({ loading: true });
    try {
      const settingsRef = doc(
        db,
        "fashiontally_brand_settings",
        currentSettings.userEmail,
      );

      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(settingsRef, updateData);

      set({
        brandSetting: {
          ...currentSettings,
          ...updateData,
        },
      });

      ShowToastMessage({
        title: "Settings updated",
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
