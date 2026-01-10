import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { Client } from "../types/client";

interface ClientState {
  clients: Client[];
  loading: boolean;
  saveClient(client: Client): Promise<void>;
  getClientById(id: string): Promise<Client | null>;
  getClientsByTailor(tailorId: string): Promise<void>;
  deleteClient(clientId: string): Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  loading: false,
  async saveClient(client) {
    set({ loading: true });
    try {
      const clientRef = doc(db, "fashiontally_clients", client.phone);
      await setDoc(clientRef, {
        ...client,
        lastUpdated: new Date().toISOString(),
      });
      set((state) => ({
        clients: state.clients.some((i) => i.id === client.id)
          ? state.clients.map((i) => (i.id === client.id ? client : i))
          : [client, ...state.clients],
      }));
    } catch (error) {
      console.error("Error saving client:", error);
    } finally {
      set({ loading: false });
    }
  },
  async getClientById(id) {
    set({ loading: true });
    try {
      const clientRef = doc(db, "fashiontally_clients", id);
      const clientDoc = await getDoc(clientRef);

      if (clientDoc.exists()) {
        return {
          id: clientDoc.id,
          ...clientDoc.data(),
        } as Client;
      }
      return null;
    } catch (error) {
      console.error("Error getting client:", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  async getClientsByTailor(tailorId) {
    set({ loading: true });
    try {
      const clientsRef = collection(db, "fashiontally_clients");
      const q = query(clientsRef, where("tailorId", "==", tailorId));
      const querySnapshot = await getDocs(q);

      const clients = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Client[];

      set({ clients });
    } catch (error) {
      console.error("Error getting clients:", error);
      throw new Error("Failed to get clients");
    } finally {
      set({ loading: false });
    }
  },

  async deleteClient(clientId) {
    set({ loading: true });
    try {
      const clientRef = doc(db, "fashiontally_clients", clientId);
      await deleteDoc(clientRef);
      console.log(`Client ${clientId} successfully deleted`);

      set((state) => ({
        clients: state.clients.filter((i) => i.id !== clientId),
      }));
    } catch (error) {
      console.error("Error deleting client:", error);
      throw new Error("Failed to delete client");
    } finally {
      set({ loading: false });
    }
  },
}));
