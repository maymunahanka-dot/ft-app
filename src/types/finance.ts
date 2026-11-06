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
  type: TransactionType;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO string
  receiptUrl?: string;
  notes?: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
};

export type Income = {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  source: IncomeSource;
  date: string; // ISO string
  orderId?: string; // Link to order if applicable
  clientName?: string;
  notes?: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
};


