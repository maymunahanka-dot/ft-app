import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { useAuth } from "../hooks/auth";
import { useUserStore } from "../stores/userSlice";

// import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [loaded] = useFonts({
    regular: require("@/assets/fonts/Baloo2-Regular.ttf"),
    medium: require("@/assets/fonts/Baloo2-Medium.ttf"),
    semibold: require("@/assets/fonts/Baloo2-SemiBold.ttf"),
    bold: require("@/assets/fonts/Baloo2-Bold.ttf"),
    black: require("@/assets/fonts/Baloo2-ExtraBold.ttf"),
    balo: require("@/assets/fonts/Baloo-Regular.ttf"),
  });

  const user = useUserStore((state) => state.user);
  const { loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || !loaded) return;

    const inTab = segments[0] === "(tabs)";
    const inProtected = segments[0] === "protected";
    const inAuth = segments[0] === "(auth)";

    const inForgetPassword =
      pathname.split("?")[0] === "/screen/forget-password";

    const isInsideAuthArea = inTab || inProtected;

    if (user) {
      if (!isInsideAuthArea && !inForgetPassword) {
        router.replace("/(tabs)/Dashboard");
        console.log("Redirecting logged-in user to Dashboard");
      }
    } else {
      if (!inAuth) {
        router.replace("/(auth)/sign-in");
        console.log("Redirecting guest to Sign-In", loaded, loading);
      }
    }
  }, [loading, router, segments, user, loaded, pathname]);

  // Expo OTA Updates once app starts
  // useEffect(() => {
  //   const checkForUpdates = async () => {
  //     try {
  //       const update = await Updates.checkForUpdateAsync();
  //       if (update.isAvailable) {
  //         console.info("New update available, fetching...");
  //         await Updates.fetchUpdateAsync();
  //         console.info("Update fetched, reloading app...");
  //         await Updates.reloadAsync();
  //       } else {
  //         console.info("No updates found.");
  //       }
  //     } catch (err) {
  //       console.error("Update check failed:", err);
  //     }
  //   };

  //   checkForUpdates();
  // }, []);

  useEffect(() => {
    if (!pathname) return;
    const currentRoute = pathname.split("?")[0];
    console.log(`Current route: ${currentRoute}`);
  }, [pathname]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="protected" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}
