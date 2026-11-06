import { ThemeProvider } from "@/src/context/ThemeContext";
import { Stack } from "expo-router";

const MoreScreenLayout = () => {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
};

export default MoreScreenLayout;
