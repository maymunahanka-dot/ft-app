import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { Expense, Income } from "../types/finance";
import { ShowToastMessage } from "../utils/random";

interface FinancialState {
  income: Income[];
  expenses: Expense[];
  loading: boolean;
  getIncomeByTailor(tailorId: string): Promise<void>;
  getExpensesByTailor(tailorId: string): Promise<void>;
  saveExpense(expense: Expense): Promise<void>;
  saveIncome(income: Income): Promise<void>;
  deleteIncome(incomeId: string): Promise<void>;
  deleteExpense(expenseId: string): Promise<void>;
}

export const useFinanceStore = create<FinancialState>((set, get) => ({
  income: [],
  expenses: [],
  loading: false,
  async getExpensesByTailor(tailorId) {
    set({ loading: true });
    try {
      const expensesRef = collection(db, "fashiontally_expenses");
      const q = query(
        expensesRef,
        where("tailorId", "==", tailorId),
        orderBy("date", "desc"),
      );
      const querySnapshot = await getDocs(q);

      const expenses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[];

      set({ expenses });
    } catch (error: any) {
      console.error("Error getting expenses:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },
  async getIncomeByTailor(tailorId) {
    set({ loading: true });
    try {
      const incomeRef = collection(db, "fashiontally_income");
      const q = query(
        incomeRef,
        where("tailorId", "==", tailorId),
        orderBy("date", "desc"),
      );
      const querySnapshot = await getDocs(q);

      const income = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Income[];

      set({ income });
    } catch (error: any) {
      console.error("Error getting income:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },
  async saveIncome(income) {
    set({ loading: true });
    try {
      const incomeRef = doc(db, "fashiontally_income", income.id);
      await setDoc(incomeRef, {
        ...income,
        updatedAt: new Date().toISOString(),
      });

      set((state) => ({
        income: state.income.some((i) => i.id === income.id)
          ? state.income.map((i) => (i.id === income.id ? income : i))
          : [income, ...state.income],
      }));
    } catch (error: any) {
      console.error("Error saving income:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },
  async saveExpense(expense) {
    set({ loading: true });
    try {
      const expenseRef = doc(db, "fashiontally_expenses", expense.id);
      await setDoc(expenseRef, {
        ...expense,
        updatedAt: new Date().toISOString(),
      });

      set((state) => ({
        expenses: state.expenses.some((i) => i.id === expense.id)
          ? state.expenses.map((i) => (i.id === expense.id ? expense : i))
          : [expense, ...state.expenses],
      }));
    } catch (error: any) {
      console.error("Error saving expense:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async deleteIncome(incomeId: string) {
    set({ loading: true });
    try {
      const incomeRef = doc(db, "fashiontally_income", incomeId);
      await deleteDoc(incomeRef);

      set((state) => ({
        income: state.income.filter((i) => i.id !== incomeId),
      }));
    } catch (error: any) {
      console.error("Error deleting income:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async deleteExpense(expenseId) {
    set({ loading: true });
    try {
      const expenseRef = doc(db, "fashiontally_expenses", expenseId);
      await deleteDoc(expenseRef);

      set((state) => ({
        expenses: state.expenses.filter((i) => i.id !== expenseId),
      }));
    } catch (error: any) {
      console.error("Error deleting expense:", error);
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
