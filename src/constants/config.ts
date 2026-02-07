import { router } from "expo-router";
import { Building2, Info, Shield, User } from "lucide-react-native";
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
