export type RegisterUserData = {
  name: string;
  // firstName: string;
  // lastName: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  businessName: string;
  role: "Designer" | "Business";
  lga: string;
  state: string;
  country: string;
  createdAt: string;
  //   state: string;
  //   lga: string;
  //   address: string;
  logo?: string;
  metadata?: any;
  // businessName?: string;
  // businessAddress?: string;
  // website?: string;
  // instagram?: string;
};

export const emptyUserData: RegisterUserData = {
  // firstName: "",
  // lastName: "",
  name: "",
  email: "",
  phone: "",
  businessName: "",
  role: "Designer",
  country: "Nigeria",
  logo: "",
  createdAt: new Date().toString(),
  lga: "",
  state: "",
};

export type BrandSettings = {
  id?: string;
  logoUrl?: string;
  businessName: string;
  businessAddress?: string;
  businessEmail?: string;
  businessWebsite?: string;
  businessPhone?: string;
  footerText?: string;
  termsAndConditions?: string;
  updatedAt: string;
  userEmail: string;
};

export const BrandSettings = {};
