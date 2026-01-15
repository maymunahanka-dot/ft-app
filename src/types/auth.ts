export type RegisterUserData = {
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  storeName: string;
  role: "Designer" | "Business";
  lga: string;
  state: string;
  country: string;
  createdAt: string;
  //   state: string;
  //   lga: string;
  //   address: string;
  businessName?: string;
  businessAddress?: string;
  website?: string;
  instagram?: string;
};

export const emptyUserData: RegisterUserData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  storeName: "",
  role: "Designer",
  country: "Nigeria",
  createdAt: new Date().toString(),
  lga: "",
  state: "",
};
