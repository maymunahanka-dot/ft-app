import { doc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { getCurrentUserId } from "../lib/auth-utils";
import { RegisterUserData } from "../types/auth";

interface UserState {
  user: RegisterUserData | null;
  updateUser: (user: RegisterUserData | null) => void;
  updateUserDetails: (user: RegisterUserData) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  updateUser(user) {
    set({ user });
  },
  async updateUserDetails(user) {
    try {
      const userId = getCurrentUserId();
      const userRef = doc(db, "fashiontally_users", userId);
      await updateDoc(userRef, user);
      return true;
    } catch (error) {
      console.error("error updating profile", error);
      return false;
    }
  },
}));
