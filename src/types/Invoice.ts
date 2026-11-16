export type InvoiceItem = {
  itemType?: string;
  category?: string;
  description: string;
  quantity: number;
  price: number;
};

export type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;

  businessName: string;
  businessAddress: string;
  logoUrl: string;

  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;

  clientId?: string;

  items: InvoiceItem[];

  notes?: string[] | string;
  termsAndConditions?: string;
  currency?: string; // "NGN"

  themeColor?: string;

  // Same fields as invoices made on the web (amounts in Naira)
  clientAddress?: string;
  createdDate?: string;
  status?: "Unpaid" | "Paid" | "Partially Paid" | string;
  paymentMethod?: string;
  discount?: number;
  taxRate?: number;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  amount?: number;
  /** Full total when Paid, typed in when Partially Paid, 0 when Unpaid */
  amountPaid?: number;
};

/** Invoice document stored in Firestore (fashiontally_invoices) */
export type Invoice = InvoiceData & {
  id: string;
  createdAt: string;
  userEmail: string;
};
