import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors } from "@/src/constants/theme";
import { useAuth } from "@/src/hooks/auth";
import { useUserImage } from "@/src/hooks/useUserImage";
import {
  DrawerItem,
  useDrawerStore,
} from "@/src/stores/navigation/drawerSlice";
import { useUserStore } from "@/src/stores/userSlice";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import {
  LegendList,
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Href, useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { PressableScale, PressablesGroup } from "pressto";
import React, { useCallback, useMemo, useRef } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "../haptic-tab";
import ImagePlaceholder from "../shared/ImagePlaceholder";
import { DrawerListItem } from "./drawer-list-item";

const keyExtractor = (item: DrawerItem) => item?.id || "";

const LIST_ITEM_HEIGHT = 60;

export const DrawerContentWidth = Dimensions.get("window").width * 0.35;

export function DrawerContent(props: DrawerContentComponentProps) {
  const { signOut, loading } = useAuth();

  const { getImageUri } = useUserImage();

  const router = useRouter();
  const user = useUserStore((state) => state.user);
  console.log("user logo", user?.logo);
  const fullName =
    (user?.firstName ?? user?.name?.split(" ")[0] ?? "") +
    " " +
    (user?.lastName ?? user?.name?.split(" ")[1] ?? "");
  const isBusiness = user?.role === "Business";
  const name = isBusiness ? (user?.storeName ?? "") : fullName;

  const { top, bottom } = useSafeAreaInsets();
  const drawerItems = useDrawerStore((state) => state.items);
  const listRef = useRef<LegendListRef>(null);

  const renderItem = useCallback(
    ({ item }: LegendListRenderItemProps<DrawerItem>) => {
      return (
        <DrawerListItem
          item={item}
          style={styles.listItem}
          onPress={() => {
            router.replace(item.route as Href);
            closeDrawer();
          }}
        />
      );
    },
    [router],
  );

  const scrollComponent = useCallback((props: any) => {
    return <ScrollView {...props} />;
  }, []);

  const estimatedListSize = useMemo(() => {
    return {
      height: LIST_ITEM_HEIGHT * drawerItems.length,
      width: DrawerContentWidth,
    };
  }, [drawerItems.length]);

  const closeDrawer = useCallback(() => {
    props.navigation.closeDrawer();
  }, [props.navigation]);

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.push("/(tabs)/Dashboard")}
          style={styles.gapRow}
        >
          <Image source={require("@/assets/images/fashion_tally_logo.png")} />
          <Text style={styles.title}>FashionTally</Text>
        </PressableScale>

        <View style={[styles.gapRow, { gap: spacing(11) }]}>
          {user?.logo ? (
            <Image
              source={{ uri: getImageUri(user.logo) }}
              style={styles.logo}
            />
          ) : (
            <ImagePlaceholder name={name} size={40} fontSize={15} />
          )}
          <Text style={styles.reg16}>{name}</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        <PressablesGroup>
          <LegendList
            recycleItems={false}
            waitForInitialLayout
            ref={listRef}
            renderItem={renderItem}
            data={drawerItems}
            estimatedListSize={estimatedListSize}
            keyExtractor={keyExtractor}
            keyboardDismissMode="on-drag"
            estimatedItemSize={LIST_ITEM_HEIGHT}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: bottom },
            ]}
            renderScrollComponent={scrollComponent}
          />
        </PressablesGroup>
      </View>

      <HapticTab style={styles.logOutBtn} hitSlop={20} onPress={signOut}>
        {loading ? (
          <ActivityIndicator size={scale(15)} color={"red"} />
        ) : (
          <>
            <LogOut size={scale(15)} color={"red"} />
            <Text style={[styles.reg16, { color: "red" }]}>Log Out</Text>
          </>
        )}
      </HapticTab>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: spacing(16),
  },
  header: {
    gap: spacing(20),
    marginBottom: spacing(8),
    marginTop: spacing(8),
    paddingBottom: spacing(25),
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.primary,
  },
  listContainer: {
    flex: 1,
    position: "relative",
  },
  listItem: {
    height: LIST_ITEM_HEIGHT,
    paddingHorizontal: spacing(20),
  },
  gapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(5),
  },
  title: {
    fontFamily: "medium",
    fontSize: scaleFontSize(24),
    letterSpacing: -0.5,
    color: Colors.primaryDark,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contentContainer: {
    marginTop: spacing(10),
    gap: spacing(10),
  },
  logo: {
    width: 40,
    aspectRatio: 1,
    borderRadius: 100,
  },
  reg16: {
    fontFamily: "regular",
    fontSize: scaleFontSize(16),
    color: Colors.primaryDark,
  },
  logOutBtn: {
    paddingHorizontal: spacing(20),
    marginBottom: spacing(50),
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(10),
  },
});
