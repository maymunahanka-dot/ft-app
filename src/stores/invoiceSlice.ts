import {
  collection,
  deleteDoc,
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
import { generateInvoiceId, generateInvoiceNumber } from "../lib/invoice";
import { Invoice, InvoiceData } from "../types/Invoice";
import { ShowToastMessage } from "../utils/random";

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  createInvoice(
    payload: Omit<InvoiceData, "invoiceNumber"> & {
      userEmail: string;
    },
  ): Promise<void>;
  getInvoicesByTailor(email: string): Promise<void>;
  editInvoice(itemId: string, updates: Partial<Invoice>): Promise<void>;
  deleteInvoice(invoiceId: string): Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  loading: false,

  async createInvoice(payload) {
    set({ loading: true });
    try {
      const id = generateInvoiceId();
      const invoiceNumber = generateInvoiceNumber();
      const now = new Date().toISOString();
      const invoiceDoc: Invoice = {
        ...payload,
        invoiceNumber,
        id,
        createdAt: now,
        userEmail: payload.userEmail,
      };
      const invoiceRef = doc(db, "fashiontally_invoices", id);
      await setDoc(invoiceRef, invoiceDoc);
      set((state) => ({ invoices: [invoiceDoc, ...state.invoices] }));
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      // throw new Error("Failed to create invoice");
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async getInvoicesByTailor(email) {
    set({ loading: true });
    try {
      const invoicesRef = collection(db, "fashiontally_invoices");
      const q = query(
        invoicesRef,
        where("userEmail", "==", email),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);

      const invoices = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Invoice[];

      set({ invoices });
    } catch (error: any) {
      console.error("Error getting invoices:", error);
      // throw new Error("Failed to get invoices");
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async editInvoice(itemId, updates) {
    set({ loading: true });
    try {
      const itemRef = doc(db, "fashiontally_invoices", itemId);

      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(itemRef, updateData);

      set((state) => ({
        invoices: state.invoices.map((item) =>
          item.id === itemId ? { ...item, ...updateData } : item,
        ),
      }));

      ShowToastMessage({
        title: "Invoice updated successfully",
        preset: "done",
        haptic: "success",
      });
    } catch (error: any) {
      console.error("Error updating Invoice item:", error);
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

  async deleteInvoice(invoiceId) {
    set({ loading: true });
    try {
      const orderRef = doc(db, "fashiontally_invoices", invoiceId);
      await deleteDoc(orderRef);
      console.log(`Invoice ${invoiceId} successfully deleted`);

      set((state) => ({
        invoices: state.invoices.filter((i) => i.id !== invoiceId),
      }));
    } catch (error: any) {
      console.error("Error deleting invoice:", error);
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
