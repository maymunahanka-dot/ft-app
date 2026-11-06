
export function generateAppointmentId(): string {
  return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}



