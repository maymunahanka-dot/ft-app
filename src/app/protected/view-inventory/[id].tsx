import { HapticTab } from "@/src/components/haptic-tab";
import { Colors } from "@/src/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { useInventoryStore } from "@/src/stores/inventorySlice";
import { initialSuppliers, storedUnitPrice } from "@/src/types/inventory";
import MoneyAmount from "@/src/components/shared/MoneyAmount";
import { useDisplayCurrency } from "@/src/hooks/useDisplayCurrency";
import {
  CapitalizeFirstName,
  formatFintechDate,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import {
  Box,
  CheckCircle,
  ChevronLeft,
  CircleDollarSign,
  Clock,
  FileText,
  Info,
  Pencil,
  SwatchBook,
  Tag,
  Trash2,
  UserIcon,
} from "lucide-react-native";
import { PhotoPlaceholder } from "@/src/components/shared/ImageUploadField";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";
import { t as tx } from "@/src/i18n";

const ViewInventoryItemScreen = () => {
  const { t: tx } = useTranslation();
  const { id } = useLocalSearchParams();

  const { isDark } = useTheme();
  const { top } = useSafeAreaInsets();

  const bg = isDark ? "#0f0f0f" : "white";
  const textColor = isDark ? Colors.text.white : "rgba(10, 10, 10, 1)";
  const subTextColor = isDark ? "rgba(160,160,160,1)" : "rgba(106, 114, 130, 1)";
  const sectionTitleColor = isDark ? "rgba(200,200,200,1)" : "rgba(54, 65, 83, 1)";
  const iconColor = isDark ? "rgba(180,180,180,1)" : "black";
  const boxBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(249, 250, 251, 1)";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(54, 65, 83, 1)";
  const recBoxBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(249, 250, 251, 1)";
  const chevronColor = isDark ? "rgba(200,200,200,1)" : "rgba(54, 65, 83, 1)";

  const loading = useInventoryStore((state) => state.loading);
  const deleteItem = useInventoryStore((state) => state.deleteInventoryItem);

  const stocks = useInventoryStore((state) => state.stocks);
  const foundInventory = stocks.find((prev) => prev.id === id.toString());
  const suppliers = initialSuppliers(foundInventory);

  const { currency, usdToNgn, symbol } = useDisplayCurrency();
  const inStock = foundInventory?.status.toLowerCase().includes("in stock");
  const unitPrice = storedUnitPrice(foundInventory);
  const totalValue = (foundInventory?.quantity ?? 0) * unitPrice;
  const unitInCurrency =
    currency !== "NGN" && usdToNgn ? (unitPrice / usdToNgn).toFixed(2) : unitPrice.toLocaleString();

  const handleDelete = () => {
    Alert.alert(
      tx("auto.deleteItem_f39c"),
      tx("auto.areYouSureYouWant_97a6"),
      [
        { text: tx("auto.cancel_77df"), style: "cancel" },
        { text: tx("auto.delete_f6fd"), onPress: () => deleteItem(foundInventory?.id ?? "") },
      ],
      { cancelable: true },
    );
  };

  const handleBack = () => {
    router.replace("/(tabs)/Inventory");
  };
  return (
    <>
      <View style={[{ flex: 1, paddingTop: top, backgroundColor: bg }]}>
        <View style={styles.header}>
          <HapticTab
            style={{
              width: 32,
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleBack}
          >
            <ChevronLeft
              size={scale(20)}
              color={chevronColor}
              strokeWidth={1.5}
            />
          </HapticTab>

          <View style={styles.col}>
            <Text style={[styles.reg20, { color: textColor }]}>{foundInventory?.name}</Text>
            <Text style={[styles.reg14g, { color: subTextColor }]}>
              {tx("auto.sku_92c9")}{" "}{foundInventory?.id.slice(0, 6)}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: bg }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? spacing(50) : spacing(0)}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ flexGrow: 1, paddingVertical: spacing(30) }}
            keyboardDismissMode="interactive"
          >
            <View style={styles.content}>
              <PhotoPlaceholder uri={foundInventory?.imageUrl} height={200} />
              <View style={styles.sections}>
                <View style={styles.section}>
                  <View style={[styles.gapRow, { gap: spacing(8) }]}>
                    <Info size={scale(14)} color={iconColor} />
                    <Text style={[styles.reg14g, { color: sectionTitleColor }]}>
                      {tx("auto.itemDetails_c209")}
                    </Text>
                  </View>

                  <View style={[styles.box, { backgroundColor: boxBg }]}>
                    <View style={[styles.gapRow, { gap: spacing(8) }]}>
                      <View style={[styles.gapRow, { gap: spacing(8) }]}>
                        <CheckCircle size={scale(12)} color={iconColor} />
                        <Text style={[styles.reg14g, { color: sectionTitleColor }]}>
                          {tx("auto.status_bae7")}
                        </Text>
                      </View>
                      <View style={[styles.badge, inStock && { backgroundColor: "rgba(220, 252, 231, 1)" }]}>
                        <Text style={[styles.reg14g, { color: inStock ? "rgba(0, 130, 54, 1)" : "rgba(231, 0, 11, 1)" }]}>
                          {foundInventory?.status}
                        </Text>
                      </View>
                    </View>

                    <View style={{ gap: spacing(20) }}>
                      <View style={styles.row}>
                        <View style={styles.col}>
                          <View style={[styles.gapRow, { gap: spacing(4) }]}>
                            <Tag size={scale(12)} color={subTextColor} />
                            <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.category_7622")}</Text>
                          </View>
                          <Text style={[styles.reg14g, { color: textColor }]}>
                            {CapitalizeFirstName(foundInventory?.category)}
                          </Text>
                        </View>

                        <View style={styles.col}>
                          <View style={[styles.gapRow, { gap: spacing(4) }]}>
                            <CircleDollarSign size={scale(12)} color={subTextColor} />
                            <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.unitPrice_757c")}</Text>
                          </View>
                          <MoneyAmount amount={unitPrice} color={textColor} />
                        </View>
                      </View>

                      <View style={{ gap: spacing(8) }}>
                        <View style={[styles.gapRow, { gap: spacing(4) }]}>
                          <UserIcon size={scale(12)} color={subTextColor} />
                          <Text style={[styles.reg12, { color: subTextColor }]}>
                            {suppliers.length > 1 ? tx("auto.suppliers_f4fa") : tx("auto.supplier_5df2")}
                          </Text>
                        </View>
                        {suppliers.length === 0 && (
                          <Text style={[styles.reg14g, { color: textColor }]}>—</Text>
                        )}
                        {suppliers.map((entry, index) => (
                          <View
                            key={`${entry.name}-${index}`}
                            style={[styles.supplierCard, { borderColor, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(248, 250, 252, 1)" }]}
                          >
                            <Text style={[styles.reg14g, { color: textColor }]}>
                              {entry.name || tx("auto.unnamedSupplier_f697")}
                            </Text>
                            {entry.contact ? (
                              <Text style={[styles.reg12, { color: subTextColor }]}>{entry.contact}</Text>
                            ) : null}
                          </View>
                        ))}
                      </View>

                      {foundInventory?.color.trim() && (
                        <View style={styles.row}>
                          <View style={styles.col}>
                            <View style={[styles.gapRow, { gap: spacing(4) }]}>
                              <SwatchBook size={scale(12)} color={subTextColor} />
                              <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.color_3417")}</Text>
                            </View>
                            <Text style={[styles.reg14g, { color: textColor }]}>
                              {CapitalizeFirstName(foundInventory.color)}
                            </Text>
                          </View>
                        </View>
                      )}

                      <View style={[styles.borderSection, { borderTopColor: borderColor }]}>
                        <View style={styles.col}>
                          <View style={[styles.gapRow, { gap: spacing(4) }]}>
                            <FileText size={scale(12)} color={subTextColor} />
                            <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.description_55f8")}</Text>
                          </View>
                          <Text
                            style={[styles.reg14g, { color: textColor, flexShrink: 1 }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {CapitalizeFirstName(foundInventory?.description)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <View style={[styles.gapRow, { gap: spacing(8) }]}>
                      <Box size={scale(14)} color={iconColor} />
                      <Text style={[styles.reg14g, { color: sectionTitleColor }]}>
                        {tx("auto.stockInformation_ae08")}
                      </Text>
                    </View>

                    <View style={[styles.row, { gap: spacing(8) }]}>
                      <View style={[styles.card, { backgroundColor: isDark ? "rgba(22,152,141,0.15)" : "rgba(240, 253, 250, 1)" }]}>
                        <Text style={[styles.reg24, { color: "rgba(22, 152, 141, 1)" }]}>
                          {foundInventory?.quantity}
                        </Text>
                        <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.currentStock_3609")}</Text>
                        <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.pieces_e917")}</Text>
                      </View>
                      <View style={[styles.card, { backgroundColor: isDark ? "rgba(245,73,0,0.12)" : "rgba(255, 247, 237, 1)" }]}>
                        <Text style={[styles.reg24, { color: "rgba(245, 73, 0, 1)" }]}>
                          {foundInventory?.reorderPoint}
                        </Text>
                        <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.reorderPoint_4f32")}</Text>
                        <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.pieces_e917")}</Text>
                      </View>
                      <View style={[styles.card, { backgroundColor: isDark ? "rgba(22,152,141,0.15)" : "rgba(240, 253, 244, 1)" }]}>
                        <MoneyAmount amount={totalValue} color="rgba(22, 152, 141, 1)" align="center" primarySize={scaleFontSize(20)} />
                        <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.totalValue_4949")}</Text>
                        <Text style={[styles.reg12, { color: subTextColor }]}>
                          {foundInventory?.quantity ?? 0} x {symbol}{unitInCurrency}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <View style={[styles.gapRow, { gap: spacing(8) }]}>
                      <Clock size={scale(15)} color={iconColor} />
                      <Text style={[styles.reg14g, { color: sectionTitleColor }]}>{tx("auto.timeline_0185")}</Text>
                    </View>

                    <View style={{ gap: spacing(12) }}>
                      <View style={[styles.recBox, { backgroundColor: recBoxBg }]}>
                        <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.created_accf")}</Text>
                        <Text style={[styles.reg14g, { color: textColor }]}>
                          {foundInventory?.createdAt ? formatFintechDate(foundInventory.createdAt) : tx("auto.nA_08d2")}
                        </Text>
                      </View>
                      <View style={[styles.recBox, { backgroundColor: recBoxBg }]}>
                        <Text style={[styles.reg12, { color: subTextColor }]}>{tx("auto.lastUpdated_66f3")}</Text>
                        <Text style={[styles.reg14g, { color: textColor }]}>
                          {foundInventory?.updatedAt ? formatFintechDate(foundInventory.updatedAt) : tx("auto.nA_08d2")}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.row, { gap: spacing(80), paddingHorizontal: spacing(16) }]}>
              <HapticTab
                style={styles.primaryBtn}
                onPress={() => {
                  router.push({
                    pathname: "/protected/inventory/[id]",
                    params: { id: foundInventory?.id ?? "" },
                  });
                }}
              >
                <Pencil size={scale(18)} color={"white"} />
                <Text style={styles.btnText}>{tx("auto.editItem_6ab4")}</Text>
              </HapticTab>

              <Pressable style={[styles.deleteBtn, { backgroundColor: isDark ? "rgba(231,0,11,0.15)" : "rgba(254, 242, 242, 1)" }]} onPress={handleDelete} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size={"small"} color={"rgba(231, 0, 11, 1)"} />
                ) : (
                  <Trash2 size={scale(15)} color={"rgba(231, 0, 11, 1)"} />
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

export default ViewInventoryItemScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: spacing(8),
  },
  col: {
    flexShrink: 1,
    gap: spacing(4),
  },
  reg20: {
    fontFamily: "regular",
    fontSize: scaleFontSize(20),
    color: "rgba(10, 10, 10, 1)",
    lineHeight: 28,
  },
  reg24: {
    fontFamily: "regular",
    fontSize: scaleFontSize(24),
    color: "rgba(10, 10, 10, 1)",
  },
  reg14g: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: "rgba(106, 114, 130, 1)",
    lineHeight: 20,
  },
  reg12: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
    color: "rgba(106, 114, 130, 1)",
  },
  reg30: {
    fontFamily: "regular",
    fontSize: scaleFontSize(30),
    color: "white",
    lineHeight: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    gap: spacing(14),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  supplierCard: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: spacing(10),
    paddingHorizontal: spacing(12),
    gap: spacing(2),
  },
  gapRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sections: {
    gap: spacing(15),
    paddingVertical: spacing(20),
  },
  section: {
    gap: spacing(16),
  },
  box: {
    gap: spacing(16),
    padding: spacing(16),
    borderRadius: 16,
  },
  badge: {
    alignSelf: "center",
    backgroundColor: "rgba(254, 242, 242, 1)",
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(5),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  borderSection: {
    paddingVertical: spacing(12),
    flexShrink: 1,
    gap: spacing(4),
    borderTopWidth: 0.5,
    borderTopColor: "rgba(54, 65, 83, 1)",
  },
  card: {
    flex: 1,
    height: 120,
    gap: spacing(4),
    padding: spacing(16),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  recBox: {
    padding: spacing(16),
    gap: spacing(4),
    borderRadius: 14,
  },
  primaryBtn: {
    flex: 1,
    height: 56,
    backgroundColor: "rgba(22, 152, 141, 1)",
    gap: spacing(8),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  deleteBtn: {
    width: 66,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  btnText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(16),
    color: "white",
    lineHeight: 24,
  },
});
