import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { formatFirestoreTimestampToISO } from "../components/invoice/util";
import { db } from "../context/firebase";
import { getCurrentUserEmail } from "../lib/auth-utils";
import { Expense, Income, TransactionType } from "../types/finance";
import { ShowToastMessage } from "../utils/random";

interface FinancialState {
  income: Income[];
  expenses: Expense[];
  loading: boolean;

  getTransactionsByTailor(tailorId: string): Promise<void>;

  saveTransaction(data: Income, type: "income"): Promise<void>;
  saveTransaction(data: Expense, type: "expense"): Promise<void>;
  editTransaction(
    id: string,
    updates: Partial<Income> | Partial<Expense>,
    type: TransactionType,
  ): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
}

export const useFinanceStore = create<FinancialState>((set, get) => ({
  income: [],
  expenses: [],
  loading: false,

  // ===============================
  // FETCH
  // ===============================
  async getTransactionsByTailor(tailorId) {
    set({ loading: true });

    try {
      const userEmail = getCurrentUserEmail();
      if (!userEmail) return;

      const ref = collection(db, "fashiontally_transactions");

      const q = query(
        ref,
        // where("tailorId", "==", tailorId),
        where("userEmail", "==", userEmail),
        orderBy("date", "desc"),
      );

      const snap = await getDocs(q);

      const income: Income[] = [];
      const expenses: Expense[] = [];

      snap.docs.forEach((d) => {
        const raw = d.data();
        console.log("transactions snap", JSON.stringify(raw, null, 2));
        // 🔥 convert timestamps → ISO
        const base = {
          ...raw,
          id: d.id,
          date: formatFirestoreTimestampToISO(raw.date as Timestamp),
          createdAt: formatFirestoreTimestampToISO(raw.createdAt as Timestamp),
          updatedAt: formatFirestoreTimestampToISO(raw.updatedAt as Timestamp),
        };

        console.log("transactions", income, expenses);

        const type = String(raw.type || "").toLowerCase();

        if (type === "income") {
          income.push(base as Income);
        } else {
          expenses.push(base as Expense);
        }
      });

      // const found = [...income, expenses].find(
      //   (prev) => prev.id === "inc_1770837235324_zo7x2jy8s",
      // );
      // console.log("found the delete tranny", JSON.stringify(found, null, 2));
      set({ income, expenses });
    } catch (error) {
      console.error("Error fetching transactions:", error);

      ShowToastMessage({
        title: "Failed to fetch transactions",
        preset: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  // ===============================
  // SAVE (single function, type-safe)
  // ===============================
  async saveTransaction(data: Income | Expense, type: TransactionType) {
    if (get().loading) return;
    set({ loading: true });
    try {
      const userEmail = getCurrentUserEmail();

      const ref = doc(db, "fashiontally_transactions", data.id);

      // const normalizedType = type.toLowerCase() as TransactionType;

      await setDoc(ref, {
        ...data,
        // type: normalizedType,
        userEmail,
        date: new Date(data.date),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(),
      });

      // 🔥 STRONG NARROWING
      if (type.toLowerCase() === "income") {
        const incomeData = data as Income;

        set((state) => {
          const exists = state.income.some((i) => i.id === incomeData.id);

          return {
            income: exists
              ? state.income.map((i) =>
                  i.id === incomeData.id ? incomeData : i,
                )
              : [incomeData, ...state.income],
          };
        });

        return;
      }

      // expense branch
      const expenseData = data as Expense;

      set((state) => {
        const exists = state.expenses.some((e) => e.id === expenseData.id);

        return {
          expenses: exists
            ? state.expenses.map((e) =>
                e.id === expenseData.id ? expenseData : e,
              )
            : [expenseData, ...state.expenses],
        };
      });
    } catch (error) {
      console.error("Error saving transaction:", error);

      ShowToastMessage({
        title: "Save failed",
        preset: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  // ===============================
  // EDIT
  // ===============================
  async editTransaction(id, updates, type) {
    set({ loading: true });
    try {
      const ref = doc(db, "fashiontally_transactions", id);

      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(ref, updateData);

      if (type.toLowerCase() === "income") {
        set((state) => ({
          income: state.income.map((i) =>
            i.id === id
              ? {
                  ...i,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : i,
          ),
        }));
      } else {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : e,
          ),
        }));
      }

      ShowToastMessage({
        title: "Transaction updated successfully",
        preset: "done",
        haptic: "success",
      });
    } catch (error) {
      console.error("Error editing transaction:", error);
      ShowToastMessage({
        title: "Update failed",
        preset: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  // ===============================
  // DELETE
  // ===============================
  async deleteTransaction(id) {
    set({ loading: true });

    try {
      await deleteDoc(doc(db, "fashiontally_transactions", id));
      const check = await getDoc(doc(db, "fashiontally_transactions", id));
      console.log("Still exists?", check.exists());

      set((state) => ({
        income: state.income.filter((i) => i.id !== id),
        expenses: state.expenses.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting transaction:", error);

      ShowToastMessage({
        title: "Delete failed",
        preset: "error",
      });
    } finally {
      set({ loading: false });
    }
  },
}));
