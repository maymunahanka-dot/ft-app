import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { Appointment } from "../types/appointment";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "../utils/calender";
import { ShowToastMessage } from "../utils/random";

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  getAppointmentsByTailor: (email: string) => Promise<(() => void) | undefined>;
  saveAppointment(appointment: Appointment): Promise<void>;
  getAppointmentById(id: string): Promise<Appointment | null>;
  getAppointmentsByDate(email: string, date: string): Promise<Appointment[]>;
  editAppoinment(itemId: string, updates: Partial<Appointment>): Promise<void>;
  deleteAppointment(appointmentId: string): Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  loading: false,
  async getAppointmentsByTailor(email) {
    set({ loading: true });
    try {
      const q = query(
        collection(db, "fashiontally_appointments"),
        where("userEmail", "==", email),
        orderBy("date", "desc"),
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const appointmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Appointment[];
        set({ appointments: appointmentsData });
        set({ loading: false });
      });

      return () => unsubscribe();
    } catch (error: any) {
      console.error("Error getting appointments:", error);
      ShowToastMessage({
        title: error.message || "Error fetching appointments",
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },
  async saveAppointment(appointment) {
    set({ loading: true });
    let calendarEventId = appointment.calendarEventId;
    try {
      if (!calendarEventId) {
        calendarEventId = await createCalendarEvent(appointment);
        console.log("Calendar event created:", calendarEventId);
      }

      const now = new Date().toISOString();

      await addDoc(collection(db, "fashiontally_appointments"), {
        ...appointment,
        userEmail: appointment.userEmail,
        tailorId: "",
        createdAt: now,
        updatedAt: now,
      });

      set((state) => ({
        appointments: state.appointments.some((i) => i.id === appointment.id)
          ? state.appointments.map((i) =>
              i.id === appointment.id ? { ...appointment, calendarEventId } : i,
            )
          : [appointment, ...state.appointments],
      }));
    } catch (error: any) {
      console.error("Error saving appointment:", error);
      ShowToastMessage({
        title: error.message || "Error saving appointment",
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },
  async getAppointmentById(id) {
    set({ loading: true });
    try {
      const appointmentRef = doc(db, "fashiontally_appointments", id);
      const appointmentDoc = await getDoc(appointmentRef);

      if (appointmentDoc.exists()) {
        return {
          id: appointmentDoc.id,
          ...appointmentDoc.data(),
        } as Appointment;
      }
      return null;
    } catch (error: any) {
      console.error("Error getting appointment:", error);
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
  async getAppointmentsByDate(email, date) {
    set({ loading: true });
    try {
      const appointmentsRef = collection(db, "fashiontally_appointments");
      const q = query(
        appointmentsRef,
        where("userEmail", "==", email),
        where("date", "==", date),
        orderBy("time", "asc"),
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
    } catch (error: any) {
      console.error("Error getting appointments by date:", error);
      ShowToastMessage({
        title: error,
        preset: "error",
        haptic: "error",
      });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  async editAppoinment(itemId, updates) {
    set({ loading: true });
    const currentAppointment = get().appointments.find((a) => a.id === itemId);
    try {
      if (currentAppointment?.calendarEventId) {
        const updatedAppointment = { ...currentAppointment, ...updates };
        await updateCalendarEvent(
          currentAppointment.calendarEventId,
          updatedAppointment,
        );
        console.log(
          "Calendar event updated:",
          currentAppointment.calendarEventId,
        );
      }

      const itemRef = doc(db, "fashiontally_appointments", itemId);

      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(itemRef, updateData);

      set((state) => ({
        appointments: state.appointments.map((item) =>
          item.id === itemId ? { ...item, ...updateData } : item,
        ),
      }));

      ShowToastMessage({
        title: "Appointment updated successfully",
        preset: "done",
        haptic: "success",
      });
    } catch (error: any) {
      console.error("Error updating Appointment item:", error);
      ShowToastMessage({
        title: "Update failed",
        message: error.message,
        preset: "error",
        haptic: "error",
      });
    } finally {
      set({ loading: false });
    }
  },

  async deleteAppointment(appointmentId: string) {
    set({ loading: true });
    const appointment = get().appointments.find((a) => a.id === appointmentId);
    try {
      if (appointment?.calendarEventId) {
        await deleteCalendarEvent(appointment.calendarEventId);
        console.log("Calendar event deleted:", appointment.calendarEventId);
      }

      const appointmentRef = doc(
        db,
        "fashiontally_appointments",
        appointmentId,
      );
      await deleteDoc(appointmentRef);
      set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== appointmentId),
      }));

      console.log(`Appointment ${appointmentId} successfully deleted`);
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
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
