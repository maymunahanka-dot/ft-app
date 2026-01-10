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

interface OrderState {
  orders: Order[];
  loading: boolean;
  getOrdersByTailor(tailorId: string): Promise<void>;
  saveOrder(order: Order): Promise<void>;
  getOrderById(id: string): Promise<Order | null>;
  deleteOrder(orderId: string): Promise<void>;
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
        orderBy("orderDate", "desc")
      );
      const querySnapshot = await getDocs(q);

      console.log(
        "orders",
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      const orders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      set({ orders });
    } catch (error) {
      console.error("Error getting orders:", error);
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
    } catch (error) {
      console.error("Error saving order:", error);
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
    } catch (error) {
      console.error("Error getting order:", error);
      return null;
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
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
