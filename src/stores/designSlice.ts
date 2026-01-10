import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { Design } from "../types/designs";

interface DesignState {
  designs: Design[];
  loading: boolean;

  getDesignsByTailor(email: string): Promise<void>;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  designs: [],
  loading: false,

  async getDesignsByTailor(email) {
    set({ loading: true });
    try {
      const clientsRef = collection(db, "fashiontally_designs");
      const q = query(
        clientsRef,
        where("userEmail", "==", email),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const designs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Design[];

      set({ designs });
    } catch (error) {
      console.error("Error getting clients:", error);
      throw new Error("Failed to get clients");
    } finally {
      set({ loading: false });
    }
  },
}));
