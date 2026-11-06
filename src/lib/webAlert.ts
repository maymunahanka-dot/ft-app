import { Alert, Platform, type AlertButton } from "react-native";

/**
 * React Native's Alert.alert does nothing on web, so confirmation dialogs
 * (log out, delete, ...) silently never appear in the browser preview.
 * On web only, fall back to the browser's own alert/confirm dialogs.
 * Phones keep the native Alert unchanged.
 */
if (Platform.OS === "web") {
  Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const text = [title, message].filter(Boolean).join("\n\n");

    if (!buttons || buttons.length <= 1) {
      window.alert(text);
      buttons?.[0]?.onPress?.();
      return;
    }

    const cancel = buttons.find((b) => b.style === "cancel");
    const confirm = [...buttons].reverse().find((b) => b !== cancel) ?? buttons[buttons.length - 1];
    if (window.confirm(text)) confirm.onPress?.();
    else cancel?.onPress?.();
  };
}
