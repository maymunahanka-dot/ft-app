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
      />
      {/* <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.tintTabColor,
          tabBarInactiveTintColor: "rgba(106, 114, 130, 1)",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            height: 80,
            elevation: 0,
            paddingTop: 5,
            display: "none",
          },
          tabBarBackground: () => (
            <View
              style={{
                height: 80,
                backgroundColor: "white",
              }}
            />
          ),
          tabBarLabelStyle: {
            fontFamily: "medium",
            fontSize: scaleFontSize(10),
          },
        }}
      >
        <Tabs.Screen
          name="Dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, focused }) => (
              <>
                {focused && <View style={styles.activeLine} />}
                <LayoutDashboard size={24} color={color} />
              </>
            ),
          }}
        />
        <Tabs.Screen
          name="Clients"
          options={{
            title: "Clients",
            tabBarIcon: ({ color, focused }) => (
              <>
                {focused && <View style={styles.activeLine} />}
                <Users size={24} color={color} />
              </>
            ),
          }}
        />
        <Tabs.Screen
          name="Inventory"
          options={{
            title: "Inventory",
            tabBarIcon: ({ color, focused }) => (
              <>
                {focused && <View style={styles.activeLine} />}
                <Box size={24} color={color} />
              </>
            ),
          }}
        />
        <Tabs.Screen
          name="Finance"
          options={{
            title: "Finance",
            tabBarIcon: ({ color, focused }) => (
              <>
                {focused && <View style={styles.activeLine} />}
                <MaterialCommunityIcons
                  name="finance"
                  size={24}
                  color={color}
                />
              </>
            ),
          }}
        />
        <Tabs.Screen
          name="More"
          options={{
            title: "More",
            tabBarIcon: ({ color, focused }) => (
              <>
                {focused && <View style={styles.activeLine} />}
                <Menu size={24} color={color} />
              </>
            ),
          }}
        />
      </Tabs> */}
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
