import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { generateDesignId } from "../lib/design";
import { Design } from "../types/designs";
import { ShowToastMessage } from "../utils/random";
import { uploadImageToCloudinary } from "../utils/uploadImageToCloudinary";

interface DesignState {
  designs: Design[];
  loading: boolean;
  createDesign(
    design: Omit<Design, "id" | "createdAt"> & { userEmail: string },
  ): Promise<void>;
  getDesignsByTailor(email: string): Promise<void>;

  editDesign(itemId: string, updates: Partial<Design>): Promise<void>;
}

export const useDesignStore = create<DesignState>((set, get) => ({
  designs: [],
  loading: false,

  async createDesign(payload) {
    set({ loading: true });
    const body = {
      ...payload,
    };
    if (!body.imageUrl) return;
    try {
      const imageUrl = await uploadImageToCloudinary(body.imageUrl);
      console.log("image url", imageUrl);
      if (!imageUrl) {
        return;
      }
      const id = generateDesignId();
      const now = new Date().toISOString();
      const design: Design = {
        ...payload,
        id,
        imageUrl,
        createdAt: now,
        category: payload.category ?? "Others",
        status: payload.status ?? "Active",
      };
      const designRef = doc(db, "fashiontally_designs", id);
      await setDoc(designRef, design);
      set((state) => ({ designs: [design, ...state.designs] }));
    } catch (error: any) {
      console.error("Error creating design:", error);
      // throw new Error("Failed to create design");
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async editDesign(itemId, updates) {
    set({ loading: true });
    let finalUpdates = { ...updates };
    if (updates.imageUrl && updates.imageUrl.startsWith("data:image")) {
      const uploadedUrl = await uploadImageToCloudinary(updates.imageUrl);
      if (!uploadedUrl) {
        set({ loading: false });
        return;
      }
      finalUpdates.imageUrl = uploadedUrl;
    }
    try {
      const itemRef = doc(db, "fashiontally_designs", itemId);

      const updateData = {
        ...finalUpdates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(itemRef, updateData);

      set((state) => ({
        designs: state.designs.map((item) =>
          item.id === itemId ? { ...item, ...updateData } : item,
        ),
      }));

      ShowToastMessage({
        title: "Design updated successfully",
        preset: "done",
        haptic: "success",
      });
    } catch (error: any) {
      console.error("Error updating Design item:", error);
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

  async getDesignsByTailor(email) {
    set({ loading: true });
    try {
      const clientsRef = collection(db, "fashiontally_designs");
      const q = query(
        clientsRef,
        where("userEmail", "==", email),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);

      const designs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Design[];

      set({ designs });
    } catch (error: any) {
      console.error("Error getting clients:", error);
      // throw new Error("Failed to get clients");
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
