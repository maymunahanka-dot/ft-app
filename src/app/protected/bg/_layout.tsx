import { Stack } from "expo-router";

const ProtectedBGScreenLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default ProtectedBGScreenLayout;
