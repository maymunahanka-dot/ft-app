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
import { getCurrentUserEmail } from "../lib/auth-utils";
import { Client, ClientMeasurements } from "../types/client";
import { ShowToastMessage } from "../utils/random";

interface ClientState {
  clients: Client[];
  loading: boolean;
  saveClient(client: Client): Promise<void>;
  editClient(updatedClient: Client, previousPhone: string): Promise<void>;
  editMeasurements(
    client: Client,
    updates: { [key: string]: string },
  ): Promise<void>;
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
    } catch (error: any) {
      console.error("Error saving client:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async editClient(updatedClient, previousPhone) {
    set({ loading: true });
    try {
      const clientData = {
        ...updatedClient,
        lastUpdated: new Date().toISOString(),
      };

      // Phone changed
      if (previousPhone !== updatedClient.phone) {
        const oldClientRef = doc(db, "fashiontally_clients", previousPhone);
        await deleteDoc(oldClientRef);

        const newClientRef = doc(
          db,
          "fashiontally_clients",
          updatedClient.phone,
        );
        await setDoc(newClientRef, {
          ...clientData,
          id: updatedClient.phone,
        });

        set((state) => ({
          clients: [
            ...state.clients.filter((c) => c.id !== previousPhone),
            { ...updatedClient, id: updatedClient.phone },
          ],
        }));
      } else {
        // Same phone: update in place
        const clientRef = doc(db, "fashiontally_clients", updatedClient.phone);
        await setDoc(clientRef, clientData);

        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === updatedClient.phone
              ? { ...updatedClient, id: updatedClient.phone }
              : c,
          ),
        }));
      }
      await get().getClientsByTailor(getCurrentUserEmail());
    } catch (error: any) {
      console.error("Error editing client:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
      throw new Error("Failed to edit client");
    } finally {
      set({ loading: false });
    }
  },

  async editMeasurements(client, updates) {
    set({ loading: true });
    try {
      const existing = client.measurements ?? ({} as ClientMeasurements);
      const merged = {
        ...existing,
        ...updates,
      };
      const updatedClient: Client = {
        ...client,
        measurements: merged,
      };
      await get().editClient(updatedClient, client.phone);
    } catch (error: any) {
      console.error("Error editing measurements:", error);
      // throw new Error("Failed to edit measurements");
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
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
    } catch (error: any) {
      console.error("Error getting client:", error);
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

  async getClientsByTailor(tailorId) {
    set({ loading: true });
    try {
      const clientsRef = collection(db, "fashiontally_clients");
      const q = query(clientsRef, where("userEmail", "==", tailorId));
      const querySnapshot = await getDocs(q);

      const clients = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Client[];

      set({ clients });
    } catch (error: any) {
      console.error("Error getting clients:", error);
      // throw new Error("Failed to get clients");
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
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
    } catch (error: any) {
      console.error("Error deleting client:", error);
      // throw new Error("Failed to delete client");
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
