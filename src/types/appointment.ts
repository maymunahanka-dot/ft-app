export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export type AppointmentType =
  | "consultation"
  | "measurement"
  | "fitting"
  | "delivery"
  | "alteration";

export type Appointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  clientId?: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
  duration: number;
  tailorId: string;
  createdAt: string;
  updatedAt: string;
};
