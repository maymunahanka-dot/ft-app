import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { create } from "zustand";
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

  deleteTransaction(id: string): Promise<void>;
}

export const useFinanceStore = create<FinancialState>((set) => ({
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
          id: d.id,
          ...raw,
          date: (raw.date as Timestamp)?.toDate().toISOString(),
          createdAt: (raw.createdAt as Timestamp)?.toDate().toISOString(),
          updatedAt: (raw.updatedAt as Timestamp)?.toDate().toISOString(),
        };

        console.log("transactions", income, expenses);

        if (raw.type.toLowerCase() === "income") {
          income.push(base as Income);
        } else {
          expenses.push(base as Expense);
        }
      });

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
    set({ loading: true });

    try {
      const userEmail = getCurrentUserEmail();

      const ref = doc(db, "fashiontally_transactions", data.id);

      await setDoc(ref, {
        ...data,
        type,
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
  // DELETE
  // ===============================
  async deleteTransaction(id) {
    set({ loading: true });

    try {
      await deleteDoc(doc(db, "fashiontally_transactions", id));

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
