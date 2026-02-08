export type ClientMeasurements = {
  neck: string;
  chest: string;
  waist: string;
  hips: string;
  shoulder: string;
  sleeveLength: string;
  shirtLength: string;
  trouserLength: string;
  inseam: string;
  thigh: string;
  knees: string;
  blouseLength: string;
  skirtLength: string;
  breastPoint: string;
  sleeveType: string;
  dressType: string;
  notes: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  measurements?: ClientMeasurements;
  notes?: string;
  tailorId: string;
  createdAt: string;
  updatedAt?: string;
};

/**
 * Calculates the number of clients created within the current calendar month.
 * @param clients - The list of all clients from your store
 * @returns The count of new clients this month
 */
export const GetNewClientsCount = (clients: Client[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const newClients = clients.filter((client) => {
    if (!client.createdAt) return false;

    const dateCreated = new Date(client.createdAt);

    return (
      dateCreated.getMonth() === currentMonth &&
      dateCreated.getFullYear() === currentYear
    );
  });

  return newClients.length;
};
