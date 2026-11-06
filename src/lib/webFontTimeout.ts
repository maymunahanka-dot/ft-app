import "expo-font";
import { Platform } from "react-native";

/**
 * On web, Expo waits at most 12s for each font (icon fonts included). In a slow
 * or background browser tab that wait runs out and the icon library throws
 * "12000ms timeout exceeded" with nothing to catch it, which shows a red
 * "Uncaught Error" screen. The font keeps loading in the browser anyway, so a
 * timeout is treated as "done" instead of an error. Phones never run this.
 */
if (Platform.OS === "web" && typeof window !== "undefined") {
  const loader = (globalThis as any).expo?.modules?.ExpoFontLoader;
  if (loader && typeof loader.loadAsync === "function" && !loader.__timeoutSafe) {
    const original = loader.loadAsync.bind(loader);
    loader.loadAsync = (name: string, resource: unknown) =>
      Promise.resolve(original(name, resource)).catch((error: any) => {
        if (/^\d+ms timeout exceeded$/.test(String(error?.message ?? error))) {
          console.warn(`[fonts] "${name}" is loading slowly, continuing without waiting.`);
          return;
        }
        throw error;
      });
    loader.__timeoutSafe = true;
  }
}
