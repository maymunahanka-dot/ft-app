import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { usePathname, useRouter, useSegments } from "expo-router";
import Drawer from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import {
  DrawerContent,
  DrawerContentWidth,
} from "../components/drawer/DrawerContent";
import { useAuth } from "../hooks/auth";
import { useSubscriptionGuard } from "../hooks/useSubscriptionGuard";
import { getCurrentUserEmail, getCurrentUserId } from "../lib/auth-utils";
import { useUserStore } from "../stores/userSlice";

// import { useColorScheme } from '@/hooks/use-color-scheme';

// export const unstable_settings = {
//   anchor: "(tabs)",
// };

const WIDTH = Dimensions.get("window").width;

const drawerOptions = {
  headerShown: false,
  drawerPosition: "left",
  drawerStyle: {
    backgroundColor: "black",
    width: Math.max(WIDTH * 0.7, 270),
  },
  drawerActiveTintColor: "#000",
  drawerInactiveTintColor: "#666",
  drawerLabelStyle: {
    fontSize: 16,
    fontWeight: "500",
  },
  overlayColor: "rgba(0, 0, 0, 0.5)",
  swipeEnabled: true,
  swipeEdgeWidth: DrawerContentWidth,
} as const;

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
    // const inSubModal = pathname.split("?")[0] === "subscription-modal";

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
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.info("New update available, fetching...");
          await Updates.fetchUpdateAsync();
          console.info("Update fetched, reloading app...");
          await Updates.reloadAsync();
        } else {
          console.info("No updates found.");
        }
      } catch (err) {
        console.error("Update check failed:", err);
      }
    };

    if (!__DEV__) checkForUpdates();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const currentRoute = pathname.split("?")[0];
    console.log(`Current route: ${currentRoute}`);
  }, [pathname]);

  const { loading: isLoading, isSubscribed } = useSubscriptionGuard({
    email: getCurrentUserEmail(),
    uuid: getCurrentUserId(),
    paymentUrl: "https://www.fashiontally.co/auth/login",
  });

  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  // if (!isSubscribed) {
  //   return null;
  // }

  if (!loaded) {
    return null;
  }

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Drawer
            screenOptions={drawerOptions}
            drawerContent={(props) => <DrawerContent {...props} />}
            backBehavior="history"
            initialRouteName={"index"}
          >
            <Drawer.Screen
              name="(auth)"
              options={{
                headerShown: false,
                drawerItemStyle: { display: "none" },
              }}
            />
            <Drawer.Screen
              name="protected"
              options={{
                headerShown: false,
                drawerItemStyle: { display: "none" },
              }}
            />
            <Drawer.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                title: "Home",
                drawerLabel: "Home",
              }}
            />
            <Drawer.Screen
              name="index"
              options={{
                headerShown: false,
                drawerItemStyle: { display: "none" },
              }}
            />
          </Drawer>
          <StatusBar style="auto" />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}
