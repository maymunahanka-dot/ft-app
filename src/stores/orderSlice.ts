import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { Order } from "../types/Order";
import { ShowToastMessage } from "../utils/random";

interface OrderState {
  orders: Order[];
  loading: boolean;
  getOrdersByTailor(tailorId: string): Promise<void>;
  saveOrder(order: Order): Promise<void>;
  getOrderById(id: string): Promise<Order | null>;
  deleteOrder(orderId: string): Promise<void>;
  updateOrderStatus(orderId: string, status: Order["status"]): Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  async getOrdersByTailor(tailorId) {
    set({ loading: true });
    try {
      const ordersRef = collection(db, "fashiontally_orders");
      const q = query(
        ordersRef,
        where("tailorId", "==", tailorId),
        orderBy("orderDate", "desc"),
      );
      const querySnapshot = await getDocs(q);

      console.log(
        "orders",
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );

      const orders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      set({ orders });
    } catch (error: any) {
      console.error("Error getting orders:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async saveOrder(order) {
    set({ loading: true });
    try {
      const orderRef = doc(db, "fashiontally_orders", order.id);
      await setDoc(orderRef, {
        ...order,
        updatedAt: new Date().toISOString(),
      });
      set((state) => ({
        orders: state.orders.some((i) => i.id === order.id)
          ? state.orders.map((i) => (i.id === order.id ? order : i))
          : [order, ...state.orders],
      }));
    } catch (error: any) {
      console.error("Error saving order:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async getOrderById(id) {
    set({ loading: true });
    try {
      const orderRef = doc(db, "fashiontally_orders", id);
      const orderDoc = await getDoc(orderRef);

      if (orderDoc.exists()) {
        return {
          id: orderDoc.id,
          ...orderDoc.data(),
        } as Order;
      }
      return null;
    } catch (error: any) {
      console.error("Error getting order:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  async updateOrderStatus(orderId, status) {
    set({ loading: true });

    try {
      const orderRef = doc(db, "fashiontally_orders", orderId);

      const updatedAt = new Date().toISOString();

      await setDoc(
        orderRef,
        {
          status,
          updatedAt,
        },
        { merge: true },
      );

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status, updatedAt } : order,
        ),
      }));
    } catch (error: any) {
      console.error("Error updating order status:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },
  async deleteOrder(orderId) {
    set({ loading: true });
    try {
      const orderRef = doc(db, "fashiontally_orders", orderId);
      await deleteDoc(orderRef);
      console.log(`Order ${orderId} successfully deleted`);

      set((state) => ({
        orders: state.orders.filter((i) => i.id !== orderId),
      }));
    } catch (error: any) {
      console.error("Error deleting order:", error);
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
