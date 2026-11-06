export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

export type GarmentType =
  | "shirt"
  | "trouser"
  | "suit"
  | "dress"
  | "blouse"
  | "skirt"
  | "jacket"
  | "traditional"
  | "other";

export type Order = {
  id: string;
  name?: string;               // design/style name (set by ft_corrent panel)
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientId?: string; // Optional, if linked to existing client
  garmentType: GarmentType;
  garmentDescription: string;
  fabric: string;
  color: string;
  quantity: number;
  measurements: {
    [key: string]: string; // Flexible measurements based on garment type
  };
  specialInstructions: string;
  price: number;
  deposit: number;
  balance: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  orderDate: string; // ISO string
  dueDate: string; // ISO string
  completionDate?: string; // ISO string, optional
  tailorId: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
};



