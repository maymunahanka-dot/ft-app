import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { type Href, Stack, usePathname, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { AppState, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { ForceUpdateScreen } from "../components/shared/ForceUpdateScreen";
import { NoNetworkBanner } from "../components/shared/NoNetworkBanner";
import { useAuth } from "../hooks/auth";
import "../lib/webAlert";
import "../lib/webFontTimeout";
import { useForceUpdate } from "../hooks/useForceUpdate";
import { useSubscriptionGuard } from "../hooks/useSubscriptionGuard";
import { expireSession, getStoredToken, getTokenExpiryMs } from "../lib/apiClient";
import { getCurrentUserEmail, getCurrentUserId } from "../lib/auth-utils";
import { routeForNotification } from "../lib/notificationRoutes";
import { listenForNotificationTaps } from "../services/notification.service";
import { useUserStore } from "../stores/userSlice";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    regular: require("@/assets/fonts/Baloo2-Regular.ttf"),
    medium: require("@/assets/fonts/Baloo2-Medium.ttf"),
    semibold: require("@/assets/fonts/Baloo2-SemiBold.ttf"),
    bold: require("@/assets/fonts/Baloo2-Bold.ttf"),
    black: require("@/assets/fonts/Baloo2-ExtraBold.ttf"),
    balo: require("@/assets/fonts/Baloo-Regular.ttf"),
  });
  // A font that fails or times out (web) must not leave the app stuck on a blank screen.
  const loaded = fontsLoaded || !!fontError;

  const user = useUserStore((state) => state.user);
  const { loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const { checked, forceUpdate, updateMessage, storeUrl } = useForceUpdate();

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

  // Sign out the moment the session token expires, even if no request is made.
  // Timers pause while the app is in the background, so re-check on return.
  useEffect(() => {
    if (!user) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = async () => {
      clearTimeout(timer);
      const token = await getStoredToken();
      const expiry = token ? getTokenExpiryMs(token) : null;
      if (!expiry) return;
      const msLeft = expiry - Date.now();
      if (msLeft <= 0) return expireSession();
      timer = setTimeout(expireSession, Math.min(msLeft, 2 ** 31 - 1));
    };
    check();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [user]);

  // Tapping a push opens the screen it's about. Wait until the session is
  // restored and the redirect above has landed inside the app.
  const [pendingRoute, setPendingRoute] = useState<Href | null>(null);
  useEffect(
    () => listenForNotificationTaps((data) => setPendingRoute(routeForNotification(data))),
    [],
  );
  useEffect(() => {
    if (!pendingRoute || loading || !loaded || !user) return;
    if (segments[0] !== "(tabs)" && segments[0] !== "protected") return;
    router.push(pendingRoute);
    setPendingRoute(null);
  }, [pendingRoute, loading, loaded, user, segments, router]);

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

  useSubscriptionGuard({
    email: user?.email ?? getCurrentUserEmail(),
    uuid: user?.uid ?? getCurrentUserId(),
    paymentUrl: "https://www.fashiontally.com/login",
  });

  if (!loaded) {
    return null;
  }

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
          <NoNetworkBanner />
          <StatusBar style="auto" translucent backgroundColor="transparent" />
          {/* Force update — rendered on top of everything, cannot be dismissed */}
          {checked && forceUpdate && (
            <ForceUpdateScreen message={updateMessage} storeUrl={storeUrl} />
          )}
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}
