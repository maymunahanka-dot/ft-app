import { create } from "zustand";
import { apiFetch } from "../lib/apiClient";
import { generateInvoiceNumber } from "../lib/invoice";
import { Invoice, InvoiceData } from "../types/Invoice";
import { readCache, writeCache } from "../utils/storeCache";
import { formatInvoiceDate, ShowToastMessage } from "../utils/random";

import { t as tx } from "@/src/i18n";

const CACHE_KEY = "store_invoices";

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  createInvoice(
    payload: Omit<InvoiceData, "invoiceNumber"> & { userEmail: string },
  ): Promise<void>;
  getInvoicesByTailor(email: string): Promise<void>;
  editInvoice(itemId: string, updates: Partial<Invoice>): Promise<void>;
  deleteInvoice(invoiceId: string): Promise<void>;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  loading: false,

  // ─── CREATE ────────────────────────────────────────────────────────────────
  async createInvoice(payload) {
    set({ loading: true });
    try {
      // Generate invoice number client-side (display only; backend generates the id)
      const invoiceNumber = generateInvoiceNumber();
      const res = await apiFetch<{ success: boolean; data: Invoice }>(
        "/invoice/create",
        {
          method: "POST",
          body: JSON.stringify({ ...payload, invoiceNumber }),
        },
      );
      const saved = res.data;
      set((state) => ({ invoices: [saved, ...state.invoices] }));
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      ShowToastMessage({ title: error.message ?? tx("auto.failedToCreateInvoice_940d"), preset: "error", haptic: "error" });
      // Let the form know it failed so it stays open (e.g. free-plan limit of 10 invoices)
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // ─── LIST ──────────────────────────────────────────────────────────────────
  async getInvoicesByTailor(_email) {
    const cached = await readCache<Invoice[]>(CACHE_KEY);
    if (cached) set({ invoices: cached });

    if (!cached) set({ loading: true });
    try {
      const res = await apiFetch<{ success: boolean; data: Invoice[] }>(
        "/invoice/list",
      );
      const fresh = (res.data ?? []).map((inv: any) => ({
        ...inv,
        id: inv.id || inv._id?.toString() || "",
        // invoices made on the web (and the backend) keep the date in createdDate
        invoiceDate: inv.invoiceDate || (inv.createdDate ? formatInvoiceDate(inv.createdDate) : ""),
      }));
      set({ invoices: fresh });
      await writeCache(CACHE_KEY, fresh);
    } catch (error: any) {
      console.error("Error getting invoices:", error);
      if (!cached) {
        ShowToastMessage({ title: error.message ?? tx("auto.failedToFetchInvoices_58b7"), preset: "error", haptic: "error" });
      }
    } finally {
      set({ loading: false });
    }
  },

  // ─── EDIT ──────────────────────────────────────────────────────────────────
  async editInvoice(itemId, updates) {
    set({ loading: true });
    try {
      const res = await apiFetch<{ success: boolean; data: Invoice }>(
        `/invoice/edit/${encodeURIComponent(itemId)}`,
        {
          method: "PUT",
          body: JSON.stringify(updates),
        },
      );
      const updated = res.data;
      set((state) => ({
        invoices: state.invoices.map((i) =>
          i.id === updated.id ? updated : i,
        ),
      }));
      ShowToastMessage({ title: tx("auto.invoiceUpdatedSuccessfully_e4ab"), preset: "done", haptic: "success" });
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      ShowToastMessage({ title: error.message ?? tx("auto.updateFailed_4de0"), preset: "error", haptic: "error" });
    } finally {
      set({ loading: false });
    }
  },

  // ─── DELETE ────────────────────────────────────────────────────────────────
  async deleteInvoice(invoiceId) {
    set({ loading: true });
    try {
      await apiFetch(`/invoice/delete/${encodeURIComponent(invoiceId)}`, {
        method: "DELETE",
      });
      set((state) => ({
        invoices: state.invoices.filter((i) => i.id !== invoiceId),
      }));
    } catch (error: any) {
      console.error("Error deleting invoice:", error);
      ShowToastMessage({ title: error.message ?? tx("auto.failedToDeleteInvoice_c5e5"), preset: "error", haptic: "error" });
    } finally {
      set({ loading: false });
    }
  },
}));
