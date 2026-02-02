export type InvoiceItem = {
  name: string;
  qty: number;
  rate: number;
};

export type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;

  businessName: string;
  businessAddress: string;
  logoUrl: string;

  billTo: string;

  clientId?: string;

  items: InvoiceItem[];

  notes?: string[];
  termsAndConditions?: string;
  currency?: string; // "NGN"
};

/** Invoice document stored in Firestore (fashiontally_invoices) */
export type Invoice = InvoiceData & {
  id: string;
  createdAt: string;
  userEmail: string;
};
