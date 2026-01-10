import { create } from "zustand";
import { RegisterUserData } from "../types/auth";

interface UserState {
  user: RegisterUserData | null;
  updateUser: (user: RegisterUserData | null) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  updateUser(user) {
    set({ user });
  },
}));
