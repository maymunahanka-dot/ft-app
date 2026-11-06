import { Stack } from "expo-router";

const ProtectedScreenLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default ProtectedScreenLayout;
