import { create } from "zustand";
import { getCurrentUserEmail, getCurrentUserId } from "../lib/auth-utils";
import { API_BASE_URL } from "../lib/apiClient";
import { setEffectiveEmail } from "../lib/effectiveEmail";
import { BrandSettings, RegisterUserData } from "../types/auth";
import { sanitizeBrandSettings, ShowToastMessage } from "../utils/random";
import { t as tx } from "@/src/i18n";

interface UserState {
  loading: boolean;
  user: RegisterUserData | null;
  brandSetting: BrandSettings | null;
  updateUser: (user: RegisterUserData | null) => void;
  fetchBrandSettings: () => Promise<void>;
  editBrandSettings(updates: Partial<BrandSettings>): Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  loading: false,
  user: null,
  brandSetting: null,
  updateUser(user) {
    set({ user });
    // Keep effectiveEmail in sync — sub-admins use the owner's email
    if (user?.isAdmin && user?.invitedBy) {
      setEffectiveEmail(user.invitedBy);
    } else {
      setEffectiveEmail(user?.email ?? "");
    }
  },
  async fetchBrandSettings() {
    set({ loading: true });

    try {
      const userEmail = getCurrentUserEmail();
      if (!userEmail) return;

      // Primary: backend MongoDB (source of truth for brand settings)
      const res = await fetch(
        `${API_BASE_URL}/brand-setting/get-by-email/${encodeURIComponent(userEmail)}`,
      );
      const data = await res.json();
      set({ brandSetting: data.success && data.data ? sanitizeBrandSettings({ ...data.data, userEmail }) : null });
    } catch (error: any) {
      console.error("Error fetching brand settings:", error);
    } finally {
      set({ loading: false });
    }
  },

  async editBrandSettings(updates: BrandSettings) {
    const docId = (updates.userEmail ?? "").trim();
    if (!docId) return false;

    const updateData: BrandSettings = sanitizeBrandSettings({
      ...updates,
      updatedAt: new Date().toISOString(),
      userEmail: docId,
    });

    set({ brandSetting: updateData });
    return true;
  },
}));
