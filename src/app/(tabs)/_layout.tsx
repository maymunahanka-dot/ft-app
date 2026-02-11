import React from "react";

import {
  DrawerContent,
  DrawerContentWidth,
} from "@/src/components/drawer/DrawerContent";
import Drawer from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { Dimensions } from "react-native";

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

export default function TabLayout() {
  return (
    <>
      <StatusBar style="inverted" />
      <Drawer
        screenOptions={drawerOptions}
        drawerContent={(props) => <DrawerContent {...props} />}
        backBehavior="history"
        initialRouteName={undefined}
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
    </>
  );
}

// const styles = StyleSheet.create({
//   activeLine: {
//     position: "absolute",
//     top: -11,
//     height: 3,
//     width: "100%",
//     backgroundColor: Colors.tintTabColor,
//   },
// });
