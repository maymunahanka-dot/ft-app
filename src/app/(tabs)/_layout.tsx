import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/src/components/haptic-tab";
import { Colors } from "@/src/constants/theme";

import { scaleFontSize } from "@/src/utils/random";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Box, LayoutDashboard, Menu, Users } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
  return (
    <>
      <StatusBar style="inverted" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.tintTabColor,
          tabBarInactiveTintColor: "rgba(106, 114, 130, 1)",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            height: 80,
            elevation: 0,
            paddingTop: 5,
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
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  activeLine: {
    position: "absolute",
    top: -11,
    height: 3,
    width: "100%",
    backgroundColor: Colors.tintTabColor,
  },
});
