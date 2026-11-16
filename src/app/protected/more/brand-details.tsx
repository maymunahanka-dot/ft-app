import PrimaryButton from "@/src/components/button/PrimaryButton";
import { HapticTab } from "@/src/components/haptic-tab";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { apiFetch, API_BASE_URL } from "@/src/lib/apiClient";
import { useUserStore } from "@/src/stores/userSlice";
import { BrandSettings } from "@/src/types/auth";
import {
  emptyBrandSettings,
  sanitizeBrandSettings,
  scale,
  scaleFontSize,
  ShowToastMessage,
  spacing,
} from "@/src/utils/random";
import { uploadImageToCloudinary } from "@/src/utils/uploadImageToCloudinary";
import { useUserImage } from "@/src/hooks/useUserImage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import SelectFilterModal from "@/src/components/shared/modal/SelectFilterModal";
import { ChevronDown, ChevronLeft, Pencil } from "lucide-react-native";
import { CURRENCY_OPTIONS, currencySymbol } from "@/src/utils/exchangeRate";

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";


import { tl } from "@/src/i18n";
const currencyLabel = (code: string) => {
  const found = CURRENCY_OPTIONS.find((c) => c.code === code);
  return `${found?.name ?? code} (${currencySymbol(code)}) · ${code}`;
};

// ─── Validation ───────────────────────────────────────────────────────────────
const validateBrandSettings = (data: BrandSettings) => {
  const nextError = emptyBrandSettings("");

  if (!data.businessName.trim())
    nextError.businessName = tx("auto.businessNameIsRequired_b048");

  if (!data.businessAddress?.trim())
    nextError.businessAddress = tx("auto.businessAddressIsRequired_f139");

  if (!data.businessPhone?.trim())
    nextError.businessPhone = tx("auto.phoneNumberIsRequired_f845");

  if (!data.businessEmail?.trim()) {
    nextError.businessEmail = tx("auto.emailAddressIsRequired_e7f0");
  } else if (!/\S+@\S+\.\S+/.test(data.businessEmail)) {
    nextError.businessEmail = tx("auto.emailAddressIsInvalid_85f8");
  }

  const website = data.businessWebsite?.trim();
  if (
    website &&
    !/^(https?:\/\/)?(www\.)?[a-z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?([\/?#].*)?$/i.test(
      website,
    )
  ) {
    nextError.businessWebsite = tx("auto.enterAValidWebsiteE_b576");
  }

  return nextError;
};

const hasErrors = (err: BrandSettings) =>
  Object.entries(err).some(
    ([key, val]) =>
      !["userEmail", "updatedAt", "primaryColor", "secondaryColor", "inventoryCurrency"].includes(key) &&
      Boolean((val as string)?.trim()),
  );

// ─── Component ────────────────────────────────────────────────────────────────
const BrandDetailsScreen = () => {
  const { t: tx } = useTranslation();
  const user = useUserStore((state) => state.user);
  const storeBrandSetting = useUserStore((state) => state.brandSetting);
  const setStoreBrand = useUserStore((state) => state.editBrandSettings);

  const { isDark } = useTheme();

  const bg = isDark ? "#0f0f0f" : "white";
  const textColor = isDark ? Colors.text.white : "rgba(54, 65, 83, 1)";
  const subTextColor = isDark ? "rgba(160,160,160,1)" : "rgba(54, 65, 83, 1)";
  const labelColor = isDark ? "rgba(160,160,160,1)" : Colors.label;
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "white";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : Colors.inputBorder;
  const inputTextColor = isDark ? Colors.text.white : Colors.black;
  const placeholderColor = isDark ? "rgba(100,100,100,1)" : Colors.grayText;
  const imageBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.8)";
  const sectionLabelColor = isDark ? "rgba(180,180,180,1)" : "rgba(74, 85, 101, 1)";
  const dividerColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  const effectiveEmail =
    user?.isAdmin && user?.invitedBy ? user.invitedBy : (user?.email ?? "");

  // ── Form state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState<BrandSettings>(() =>
    sanitizeBrandSettings({ userEmail: effectiveEmail }),
  );
  const [error, setError] = useState<BrandSettings>(() =>
    emptyBrandSettings(""),
  );

  // ── Loading flags ────────────────────────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currencyModal, setCurrencyModal] = useState(false);

  const { image, pickImage, getImageUri } = useUserImage({
    returnBase64: true,
    maxWidth: 256,
    compress: 0.4,
  });

  // ── Sync new picked image into form ─────────────────────────────────────
  useEffect(() => {
    if (image) setForm((prev) => ({ ...prev, logoUrl: image }));
  }, [image]);

  // ── Load brand data from backend on mount ────────────────────────────────
  useEffect(() => {
    const loadBrand = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/brand-setting/get-by-email/${encodeURIComponent(effectiveEmail)}`,
        );
        const data = await res.json();
        if (data.success && data.data) {
          setForm(sanitizeBrandSettings({ ...data.data, userEmail: effectiveEmail }));
        } else if (storeBrandSetting) {
          // Fall back to cached store data
          setForm(sanitizeBrandSettings({ ...storeBrandSetting, userEmail: effectiveEmail }));
        }
      } catch {
        // Network error — fall back to store cache
        if (storeBrandSetting) {
          setForm(sanitizeBrandSettings({ ...storeBrandSetting, userEmail: effectiveEmail }));
        }
      } finally {
        setInitialLoading(false);
      }
    };
    loadBrand();
  }, []);

  const handleChange = (field: keyof BrandSettings, value: string) => {
    setForm((prev) => sanitizeBrandSettings({ ...prev, [field]: value }));
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const clean = sanitizeBrandSettings(form);

    const nextError = validateBrandSettings(clean);
    setError(nextError);
    if (hasErrors(nextError)) {
      ShowToastMessage({ title: tx("auto.pleaseFixTheErrors_754b"), preset: "error", haptic: "error" });
      return;
    }

    setSaving(true);
    try {
      // Upload logo if it's a local file / base64
      let finalLogoUrl = clean.logoUrl ?? "";
      if (
        finalLogoUrl &&
        (finalLogoUrl.startsWith("data:") || finalLogoUrl.startsWith("file:"))
      ) {
        setLogoUploading(true);
        const uploaded = await uploadImageToCloudinary(finalLogoUrl);
        setLogoUploading(false);
        if (uploaded) finalLogoUrl = uploaded;
      }

      const payload = sanitizeBrandSettings({
        ...clean,
        id: effectiveEmail,
        userEmail: effectiveEmail,
        logoUrl: finalLogoUrl,
        updatedAt: new Date().toISOString(),
      });

      // Try edit first — fall back to create if the doc doesn't exist yet
      // (matches exact web logic)
      let success = false;
      try {
        const editRes = await apiFetch<{ success: boolean; data: any }>(
          `/brand-setting/edit/${encodeURIComponent(effectiveEmail)}`,
          { method: "PUT", body: JSON.stringify(payload) },
        );
        success = editRes.success;
      } catch {
        // edit threw (404 → brand not created yet) — create it
        const createRes = await apiFetch<{ success: boolean; data: any }>(
          "/brand-setting/create",
          { method: "POST", body: JSON.stringify(payload) },
        );
        success = createRes.success;
      }

      if (success) {
        // Sync the Zustand store so the rest of the app is up to date
        await setStoreBrand(payload);
        ShowToastMessage({ title: tx("auto.brandSettingsSaved_419c"), preset: "done", haptic: "success" });
        router.replace("/(tabs)/More");
      } else {
        ShowToastMessage({ title: tx("auto.updateFailed_4de0"), preset: "error", haptic: "error" });
      }
    } catch (err: any) {
      ShowToastMessage({
        title: tx("auto.updateFailed_4de0"),
        message: err.message,
        preset: "error",
        haptic: "error",
      });
    } finally {
      setSaving(false);
      setLogoUploading(false);
    }
  };

  const handleBack = () => router.replace("/(tabs)/More");

  const getBrandInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  const imageUrl = form.logoUrl;

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <SafeAreaView
        edges={["top", "left", "right", "bottom"]}
        style={{ flex: 1, backgroundColor: bg, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.reg14, { color: subTextColor, marginTop: spacing(12) }]}>
          {tx("auto.loadingBrandSettings_fb73")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={{ flex: 1, paddingTop: spacing(10), backgroundColor: bg }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <HapticTab
          style={{ width: 32, aspectRatio: 1, justifyContent: "center", alignItems: "center" }}
          onPress={handleBack}
        >
          <ChevronLeft
            size={scale(20)}
            color={isDark ? "rgba(200,200,200,1)" : "rgba(54, 65, 83, 1)"}
            strokeWidth={1.5}
          />
        </HapticTab>
        <View style={styles.col}>
          <Text style={[styles.reg24, { color: textColor }]}>{tx("auto.brand_62b4")}</Text>
          <Text style={[Styles.reg14, { color: subTextColor }]}>
            {tx("auto.manageYourBusinessDetails_3c5f")}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: bg }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? spacing(50) : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ flexGrow: 1, paddingVertical: spacing(30) }}
          keyboardDismissMode="interactive"
        >
          <View style={styles.content}>

            {/* ── Logo ── */}
            <View style={styles.logoSection}>
              <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>
                {tx("auto.brandLogo_25dd")}
              </Text>
              <View style={styles.logoRow}>
                <View style={styles.logoDisplayWrapper}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: getImageUri(imageUrl) }}
                      style={[styles.logoImage, { borderColor: imageBorder }]}
                    />
                  ) : (
                    <View style={[styles.logoPlaceholder, { borderColor: imageBorder }]}>
                      <Text style={[styles.logoInitials, { color: textColor }]}>
                        {getBrandInitials(form.businessName)}
                      </Text>
                    </View>
                  )}
                  {logoUploading && (
                    <View style={styles.logoOverlay}>
                      <ActivityIndicator size="small" color="white" />
                    </View>
                  )}
                  <HapticTab
                    hitSlop={20}
                    style={styles.pickIcon}
                    onPress={pickImage}
                    disabled={logoUploading}
                  >
                    <Pencil size={scale(14)} color="white" />
                  </HapticTab>
                </View>
              </View>
            </View>

            {/* ── Business info ── */}
            <View style={styles.inputs}>
              <Field
                label={tx("auto.brandName_45fb")}
                value={form.businessName}
                onChangeText={(t) => handleChange("businessName", t)}
                placeholder={tx("auto.mSDesign_4759")}
                error={error.businessName}
                labelColor={labelColor}
                inputBg={inputBg}
                inputBorder={inputBorder}
                inputTextColor={inputTextColor}
                placeholderColor={placeholderColor}
              />

              <Field
                label={tx("auto.businessAddress_6a24")}
                value={form.businessAddress}
                onChangeText={(t) => handleChange("businessAddress", t)}
                placeholder={tx("auto.12FashionStreetVictoriaIsland_f97b")}
                error={error.businessAddress}
                multiline
                numberOfLines={3}
                labelColor={labelColor}
                inputBg={inputBg}
                inputBorder={inputBorder}
                inputTextColor={inputTextColor}
                placeholderColor={placeholderColor}
              />

              <Field
                label={tx("auto.phoneNumber_ab25")}
                value={form.businessPhone}
                onChangeText={(t) => handleChange("businessPhone", t)}
                placeholder="+234 803 456 7890"
                error={error.businessPhone}
                keyboardType="phone-pad"
                labelColor={labelColor}
                inputBg={inputBg}
                inputBorder={inputBorder}
                inputTextColor={inputTextColor}
                placeholderColor={placeholderColor}
              />

              <Field
                label={tx("auto.email_84ad")}
                value={form.businessEmail}
                onChangeText={(t) => handleChange("businessEmail", t)}
                placeholder="hello@mybrand.com"
                error={error.businessEmail}
                keyboardType="email-address"
                labelColor={labelColor}
                inputBg={inputBg}
                inputBorder={inputBorder}
                inputTextColor={inputTextColor}
                placeholderColor={placeholderColor}
              />

              <Field
                label={tx("auto.website_2e8a")}
                value={form.businessWebsite}
                onChangeText={(t) => handleChange("businessWebsite", t)}
                placeholder="www.mybrand.com"
                error={error.businessWebsite}
                keyboardType="url"
                labelColor={labelColor}
                inputBg={inputBg}
                inputBorder={inputBorder}
                inputTextColor={inputTextColor}
                placeholderColor={placeholderColor}
              />

              <Field
                label={tx("auto.instagramHandle_9925")}
                value={form.instagramHandle}
                onChangeText={(t) => handleChange("instagramHandle", t)}
                placeholder="@mybrand"
                labelColor={labelColor}
                inputBg={inputBg}
                inputBorder={inputBorder}
                inputTextColor={inputTextColor}
                placeholderColor={placeholderColor}
              />
            </View>

            {/* ── Brand Colors ── */}
            <View style={[styles.section, { borderTopColor: dividerColor }]}>
              <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>
                {tx("auto.brandColors_d071")}
              </Text>
              <View style={styles.inputs}>
                <ColorField
                  label={tx("auto.primaryColor_d3dc")}
                  value={form.primaryColor ?? "#000000"}
                  onChangeText={(t) => handleChange("primaryColor", t)}
                  labelColor={labelColor}
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                  inputTextColor={inputTextColor}
                  placeholderColor={placeholderColor}
                />
                <ColorField
                  label={tx("auto.secondaryColor_7a87")}
                  value={form.secondaryColor ?? "#666666"}
                  onChangeText={(t) => handleChange("secondaryColor", t)}
                  labelColor={labelColor}
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                  inputTextColor={inputTextColor}
                  placeholderColor={placeholderColor}
                />
              </View>
            </View>

            {/* ── Invoice settings ── */}
            <View style={[styles.section, { borderTopColor: dividerColor }]}>
              <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>
                {tx("auto.invoiceSettings_1a0e")}
              </Text>
              <View style={styles.inputs}>
                <Field
                  label={tx("auto.invoiceFooterText_ea73")}
                  value={form.footerText}
                  onChangeText={(t) => handleChange("footerText", t)}
                  placeholder={tx("auto.thankYouForYourBusiness_80f9")}
                  multiline
                  numberOfLines={3}
                  labelColor={labelColor}
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                  inputTextColor={inputTextColor}
                  placeholderColor={placeholderColor}
                />
                <Field
                  label={tx("auto.termsConditions_d35f")}
                  value={form.termsAndConditions}
                  onChangeText={(t) => handleChange("termsAndConditions", t)}
                  placeholder={tx("auto.aMinimumOf60Is_b509")}
                  multiline
                  numberOfLines={4}
                  labelColor={labelColor}
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                  inputTextColor={inputTextColor}
                  placeholderColor={placeholderColor}
                />
              </View>
            </View>

            <View style={[styles.section, { borderTopColor: dividerColor }]}>
              <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>{tx("auto.currency_e070")}</Text>
              <Pressable
                style={[styles.currencyRow, { backgroundColor: inputBg, borderColor: inputBorder }]}
                onPress={() => setCurrencyModal(true)}
              >
                <Text style={[Styles.reg16, { color: inputTextColor, flex: 1 }]}>
                  {currencyLabel(form.inventoryCurrency || "NGN")}
                </Text>
                <ChevronDown size={scale(18)} color={labelColor} />
              </Pressable>
              <Text style={[styles.currencyHint, { color: labelColor }]}>
                {tx("auto.moneyIsShownInThis_bc0b")}
              </Text>
            </View>

            {/* ── Bank Details ── */}
            <View style={[styles.section, { borderTopColor: dividerColor }]}>
              <Text style={[styles.sectionLabel, { color: sectionLabelColor }]}>
                {tx("auto.bankDetails_7bc4")}
              </Text>
              <View style={styles.inputs}>
                <Field
                  label={tx("auto.bankName_3126")}
                  value={form.bankName}
                  onChangeText={(t) => handleChange("bankName", t)}
                  placeholder={tx("auto.gtbank_169d")}
                  labelColor={labelColor}
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                  inputTextColor={inputTextColor}
                  placeholderColor={placeholderColor}
                />
                <Field
                  label={tx("auto.accountNumber_0bd6")}
                  value={form.accountNumber}
                  onChangeText={(t) => handleChange("accountNumber", t)}
                  placeholder="0123456789"
                  keyboardType="number-pad"
                  labelColor={labelColor}
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                  inputTextColor={inputTextColor}
                  placeholderColor={placeholderColor}
                />
                <Field
                  label={tx("auto.accountName_db3b")}
                  value={form.accountName}
                  onChangeText={(t) => handleChange("accountName", t)}
                  placeholder={tx("auto.mSDesign_4759")}
                  labelColor={labelColor}
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                  inputTextColor={inputTextColor}
                  placeholderColor={placeholderColor}
                />
              </View>
            </View>

            <View style={styles.button}>
              <PrimaryButton
                title={tx("auto.saveChanges_fa29")}
                onPress={handleSave}
                loading={saving || logoUploading}
                props={{ disabled: saving || logoUploading }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
      {currencyModal && (
        <SelectFilterModal
          data={CURRENCY_OPTIONS.map((c) => ({ label: currencyLabel(c.code), value: c.code }))}
          visible={currencyModal}
          selected={form.inventoryCurrency || "NGN"}
          searchable
          searchPlaceholder={tx("auto.searchCurrencyEGYuan_ff91")}
          handleOption={(option) => handleChange("inventoryCurrency", option)}
          onClose={() => setCurrencyModal(false)}
        />
      )}
    </>
  );
};

export default BrandDetailsScreen;

// ─── Shared field sub-components ─────────────────────────────────────────────
type FieldProps = {
  label: string;
  value?: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: any;
  labelColor: string;
  inputBg: string;
  inputBorder: string;
  inputTextColor: string;
  placeholderColor: string;
};

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  numberOfLines = 1,
  keyboardType = "default",
  labelColor,
  inputBg,
  inputBorder,
  inputTextColor,
  placeholderColor,
}: FieldProps) => (
  <View style={Styles.inputContainer}>
    <Text style={[Styles.label, { color: labelColor }]}>{tl(label)}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={tl(placeholder)}
      placeholderTextColor={placeholderColor}
      keyboardType={keyboardType}
      returnKeyType={multiline ? "default" : "next"}
      autoCorrect={false}
      multiline={multiline}
      numberOfLines={multiline ? numberOfLines : undefined}
        style={[
          Styles.input,
          {
            height: multiline ? undefined : 48,
            paddingVertical: multiline ? spacing(12) : 0,
            paddingTop: multiline ? spacing(12) : 0,
            minHeight: multiline ? numberOfLines * 24 : 48,
            textAlignVertical: multiline ? "top" : "center",
            backgroundColor: inputBg,
            borderColor: inputBorder,
            paddingHorizontal: spacing(16),
            color: inputTextColor,
          },
        ]}
    />
    {error ? (
      <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>{error}</Text>
    ) : null}
  </View>
);

type ColorFieldProps = Omit<FieldProps, "multiline" | "numberOfLines"> & {
  value: string;
};

const ColorField = ({ label, value, onChangeText, labelColor, inputBg, inputBorder, inputTextColor, placeholderColor }: ColorFieldProps) => (
  <View style={Styles.inputContainer}>
    <Text style={[Styles.label, { color: labelColor }]}>{tl(label)}</Text>
    <View style={[Styles.inputRow ?? {}, { flexDirection: "row", alignItems: "center", gap: spacing(8) }]}>
      {/* Color swatch */}
      <View
        style={[
          styles.colorSwatch,
          {
            backgroundColor: /^#[0-9A-Fa-f]{3,6}$/.test(value) ? value : "#000000",
            borderColor: inputBorder,
          },
        ]}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="#000000"
        placeholderTextColor={placeholderColor}
        autoCorrect={false}
        autoCapitalize="characters"
        maxLength={7}
        style={[
          Styles.input,
          {
            flex: 1,
            height: 48,
            paddingVertical: 0,
            backgroundColor: inputBg,
            borderColor: inputBorder,
            paddingHorizontal: spacing(16),
            color: inputTextColor,
          },
        ]}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: spacing(8),
    paddingHorizontal: spacing(16),
    paddingVertical: spacing(6),
  },
  col: {
    gap: spacing(4),
  },
  reg24: {
    fontFamily: "regular",
    fontSize: scaleFontSize(24),
    lineHeight: 32,
  },
  reg14: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    gap: spacing(28),
  },
  logoSection: {
    gap: spacing(10),
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoDisplayWrapper: {
    position: "relative",
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderWidth: 0.2,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderWidth: 0.2,
    backgroundColor: "rgba(22,152,141,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoInitials: {
    fontFamily: "regular",
    fontSize: scaleFontSize(22),
  },
  logoOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: spacing(7),
    borderRadius: 10,
  },
  sectionLabel: {
    fontFamily: "medium",
    fontSize: scaleFontSize(13),
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  section: {
    gap: spacing(12),
    paddingTop: spacing(20),
    borderTopWidth: 1,
  },
  inputs: {
    gap: spacing(16),
  },
  colorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  button: {},
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing(16),
  },
  currencyHint: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
    lineHeight: 18,
  },
});
