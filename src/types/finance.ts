export type ExpenseCategory =
  | "materials"
  | "rent"
  | "utilities"
  | "equipment"
  | "marketing"
  | "transportation"
  | "meals"
  | "insurance"
  | "taxes"
  | "other";

export type IncomeSource =
  | "order_payment"
  | "deposit"
  | "alteration"
  | "consultation"
  | "other";

export type TransactionType = "income" | "expense";

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO string
  receiptUrl?: string;
  notes?: string;
  tailorId: string;
  createdAt: string;
  updatedAt: string;
};

export type Income = {
  id: string;
  description: string;
  amount: number;
  source: IncomeSource;
  date: string; // ISO string
  orderId?: string; // Link to order if applicable
  clientName?: string;
  notes?: string;
  tailorId: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Calculates the raw percentage change in income between the current and previous month.
 * @param incomeList - Array of income objects
 * @returns A rounded number representing the percentage change (e.g., 18, -10, 0)
 */
export const GetMonthlyIncomeChangeValue = (incomeList: Income[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Calculate Previous Month/Year
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // 2. Total for Current Month
  const currentMonthTotal = incomeList
    .filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    })
    .reduce((acc, item) => acc + item.amount, 0);

  // 3. Total for Previous Month
  const prevMonthTotal = incomeList
    .filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === prevMonth && itemDate.getFullYear() === prevYear
      );
    })
    .reduce((acc, item) => acc + item.amount, 0);

  // 4. Calculate Percentage
  if (prevMonthTotal === 0) {
    // If last month was 0 and this month > 0, return 100% growth
    // If both are 0, return 0% growth
    return currentMonthTotal > 0 ? 100 : 0;
  }

  const percentageChange =
    ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;

  // 5. Return as a rounded integer
  return Math.round(percentageChange);
};
