/**
 * Marks hardware features as optional in AndroidManifest.xml so Google Play doesn't hide the app
 * from devices without them.
 *
 * - android.hardware.wifi: implied by the Wi-Fi permission expo-network adds.
 * - android.hardware.screen.portrait: implied by "orientation": "portrait".
 * Neither is needed for the app to work, so both are declared with required="false".
 */
const { withAndroidManifest } = require("expo/config-plugins");

const OPTIONAL_FEATURES = ["android.hardware.wifi", "android.hardware.screen.portrait"];

module.exports = function withOptionalHardwareFeatures(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest["uses-feature"] = manifest["uses-feature"] || [];
    for (const name of OPTIONAL_FEATURES) {
      const existing = manifest["uses-feature"].find((f) => f.$?.["android:name"] === name);
      if (existing) existing.$["android:required"] = "false";
      else manifest["uses-feature"].push({ $: { "android:name": name, "android:required": "false" } });
    }
    return cfg;
  });
};
