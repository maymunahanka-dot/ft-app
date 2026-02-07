import { router } from "expo-router";
import { Building2, Info, Shield, User, Users } from "lucide-react-native";
import { Linking } from "react-native";

export const MoreSection = [
  {
    icon: User,
    title: "Profile",
    details: "Personal Details",
    onPress: () => {
      router.replace("/protected/more/edit-profile");
    },
  },
  {
    icon: Building2,
    title: "Brand",
    details: "Business Information",
    onPress: () => {
      router.replace("/protected/more/brand-details");
    },
  },
  {
    icon: Users,
    title: "Team",
    details: "Manage team members",
    onPress: () => {
      Linking.openURL("https://www.fashiontally.co/settings?tab=admins");
    },
  },
  {
    icon: Shield,
    title: "Security",
    details: "Password & authentication",
    onPress: () => {
      router.replace("/protected/more/security-details");
    },
  },
  {
    icon: Info,
    title: "About Us",
    details: "Learn more about Fashion tally",
    onPress: () => {
      Linking.openURL("https://www.fashiontally.co/about");
    },
  },
];

export const categoryList = [
  {
    label: "Fabric",
    value: "fabric",
  },
  {
    label: "Thread",
    value: "thread",
  },
  {
    label: "Button",
    value: "button",
  },
  {
    label: "Zipper",
    value: "zipper",
  },
  {
    label: "Lining",
    value: "lining",
  },
  {
    label: "Interfacing",
    value: "interfacing",
  },
  {
    label: "Elastic",
    value: "elastic",
  },
  {
    label: "Trim",
    value: "trim",
  },
  {
    label: "Accessory",
    value: "accessory",
  },
  {
    label: "Tool",
    value: "tool",
  },
  {
    label: "Other",
    value: "other",
  },
];

export const statusList = [
  {
    label: "In Stock",
    value: "in-stock",
  },
  {
    label: "Low Stock",
    value: "low-stock",
  },
  {
    label: "Out of Stock",
    value: "out-of-stock",
  },
  {
    label: "Discontinued",
    value: "discontinued",
  },
];

export const unitList = [
  {
    label: "Yards",
    value: "yards",
  },
  {
    label: "Meters",
    value: "meters",
  },
  {
    label: "Pieces",
    value: "pieces",
  },
  {
    label: "Spools",
    value: "spools",
  },
  {
    label: "Packets",
    value: "packets",
  },
  {
    label: "Rolls",
    value: "rolls",
  },
  {
    label: "Sets",
    value: "sets",
  },
  {
    label: "Kilograms",
    value: "kg",
  },
  {
    label: "Grams",
    value: "grams",
  },
  {
    label: "Other",
    value: "other",
  },
];
