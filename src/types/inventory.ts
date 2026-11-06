export type InventoryCategory =
  | "fabrics"
  | "threads"
  | "button"
  | "zipper"
  | "lining"
  | "interfacing"
  | "elastic"
  | "trim"
  | "accessories"
  | "tools"
  | "other";

export type InventoryUnit =
  | "yards"
  | "meters"
  | "pieces"
  | "spools"
  | "packets"
  | "rolls"
  | "sets"
  | "kg"
  | "grams"
  | "other";

export type InventoryStatus =
  | "in-stock"
  | "low-stock"
  | "out-of-stock"
  | "discontinued";

export type InventorySupplier = {
  name: string;
  contact: string;
};

export const initialSuppliers = (
  item?: { suppliers?: InventorySupplier[]; supplierName?: string; supplier?: string } | null,
): InventorySupplier[] => {
  if (item?.suppliers?.some((entry) => entry?.name || entry?.contact)) {
    return item.suppliers
      .filter((entry) => entry?.name || entry?.contact)
      .map((entry) => ({ name: entry.name || "", contact: entry.contact || "" }));
  }
  const name = item?.supplierName || item?.supplier || "";
  return name ? [{ name, contact: "" }] : [];
};

export const storedUnitPrice = (item?: {
  price?: number;
  sellingPricePerUnit?: number;
  costPerUnit?: number;
} | null) => {
  const selling = Number(item?.sellingPricePerUnit);
  if (Number.isFinite(selling) && selling > 0) return selling;
  const price = Number(item?.price);
  if (Number.isFinite(price) && price > 0) return price;
  const cost = Number(item?.costPerUnit);
  return Number.isFinite(cost) ? cost : 0;
};

export const cleanSuppliers = (suppliers: InventorySupplier[]) =>
  suppliers
    .map((entry) => ({ name: entry.name.trim(), contact: entry.contact.trim() }))
    .filter((entry) => entry.name || entry.contact);

export type InventoryItem = {
  id: string;
  name: string;
  category: InventoryCategory;
  description: string;
  supplier: string;
  supplierName: string;
  suppliers?: InventorySupplier[];
  color: string;
  material: string; // e.g., cotton, silk, polyester
  quantity: number;
  unit: InventoryUnit;
  minStockLevel?: number; // Reorder point
  reorderPoint?: number;
  costPerUnit?: number;
  sellingPricePerUnit?: number;
  price?: number;
  totalValue: number; // quantity * costPerUnit
  status: InventoryStatus;
  purchaseDate?: string; // ISO string
  expiryDate?: string; // Optional, for items that expire
  batchNumber?: string; // Optional, for tracking batches
  imageUrl?: string;
  notes?: string;
  tailorId: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
};



