import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { InventoryItem } from "../types/inventory";
import { ShowToastMessage } from "../utils/random";

interface InventoryState {
  stocks: InventoryItem[];
  loading: boolean;
  saveInventoryItem(item: InventoryItem): Promise<void>;
  getInventoryItemById(id: string): Promise<InventoryItem | null>;
  getInventoryByTailor(tailorId: string): Promise<void>;
  editInventoryItem(
    itemId: string,
    updates: Partial<InventoryItem>,
  ): Promise<void>;
  deleteInventoryItem(itemId: string): Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  stocks: [],
  loading: false,
  async saveInventoryItem(item) {
    set({ loading: true });
    try {
      const itemRef = doc(db, "fashiontally_inventory", item.id);
      await setDoc(itemRef, {
        ...item,
        updatedAt: new Date().toISOString(),
      });

      set((state) => ({
        stocks: state.stocks.some((i) => i.id === item.id)
          ? state.stocks.map((i) => (i.id === item.id ? item : i))
          : [item, ...state.stocks],
      }));
    } catch (error: any) {
      console.error("Error saving inventory item:", error);
      // throw new Error("Failed to save inventory item");
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async getInventoryItemById(id) {
    set({ loading: true });
    try {
      const itemRef = doc(db, "fashiontally_inventory", id);
      const itemDoc = await getDoc(itemRef);

      if (itemDoc.exists()) {
        return {
          id: itemDoc.id,
          ...itemDoc.data(),
        } as InventoryItem;
      }
      return null;
    } catch (error: any) {
      console.error("Error getting inventory item:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  async getInventoryByTailor(tailorId) {
    set({ loading: true });
    try {
      const inventoryRef = collection(db, "fashiontally_inventory");
      const q = query(
        inventoryRef,
        where("userEmail", "==", tailorId),
        orderBy("name", "asc"),
      );
      const querySnapshot = await getDocs(q);

      const stocks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[];

      set({ stocks });
    } catch (error: any) {
      console.error("Error getting inventory:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async editInventoryItem(itemId, updates) {
    set({ loading: true });
    try {
      const itemRef = doc(db, "fashiontally_inventory", itemId);

      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(itemRef, updateData);

      set((state) => ({
        stocks: state.stocks.map((item) =>
          item.id === itemId ? { ...item, ...updateData } : item,
        ),
      }));

      ShowToastMessage({
        title: "Inventory updated successfully",
        preset: "done",
        haptic: "success",
      });
    } catch (error: any) {
      console.error("Error updating inventory item:", error);
      ShowToastMessage({
        title: "Update failed",
        message: error.message,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async deleteInventoryItem(itemId) {
    set({ loading: true });
    try {
      const itemRef = doc(db, "fashiontally_inventory", itemId);
      await deleteDoc(itemRef);
      console.log(`Inventory item ${itemId} successfully deleted`);

      set((state) => ({
        stocks: state.stocks.filter((i) => i.id !== itemId),
      }));
    } catch (error: any) {
      console.error("Error deleting inventory item:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },
}));
