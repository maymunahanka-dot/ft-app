import AppointmentsList from "@/src/components/appointment/appointments";
import { OverallSalesChart } from "@/src/components/dashboard/graph/OverallSalesChart";
import StatsBoxes from "@/src/components/dashboard/stats/StatsBoxes";
import StatCircle from "@/src/components/dashboard/stats/StatsCircle";
import { HapticTab } from "@/src/components/haptic-tab";
import ActionItem from "@/src/components/shared/action/item";
import TabImageBackground from "@/src/components/shared/TabScreenBg";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useTimeSince } from "@/src/hooks/timeSince";
import { useFinanceStore } from "@/src/stores/financeSlice";
import { useOrderStore } from "@/src/stores/orderSlice";
import {
  GetAverageOrderValue,
  GetOrderCompletionRate,
} from "@/src/types/Order";
import {
  FormatNairaShorthand,
  GetFormattedDate,
  scale,
  spacing,
} from "@/src/utils/random";
import { router } from "expo-router";
import {
  CalendarClock,
  FileText,
  Plus,
  UserRoundPlus,
} from "lucide-react-native";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GraphValue = SCREEN_WIDTH / 3 - 25;

const DashboardScreen = () => {
  // const { loading, signOut } = useAuth();

  // const user = useUserStore((state) => state.user);

  const timeAgo = useTimeSince();

  const income = useFinanceStore((state) => state.income);

  const orders = useOrderStore((state) => state.orders);
  const orderCompletionRate = GetOrderCompletionRate(orders);
  const avgValue = GetAverageOrderValue(orders);

  // const fetchData = useCallback(async () => {
  //   if (!user) return;
  //   try {
  //     await Promise.all([fetchOrder(user.email)]);
  //     console.log("fetched data success!!");
  //   } catch (error) {
  //     console.error("error fetching data", error);
  //   }
  // }, [fetchOrder, user]);

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  // useEffect(() => {
  //   signOut();
  // }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["bottom"]}
    >
      <TabImageBackground
        title="Dashbaord"
        rightIcon={() => (
          <HapticTab
            hitSlop={20}
            onPress={() => router.push("/(tabs)/Appointments")}
          >
            <CalendarClock size={scale(24)} color="white" />
          </HapticTab>
        )}
        drawer
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[Styles.med16, { color: Colors.text.black }]}>
              Quick Actions
            </Text>

            <View style={styles.actions}>
              <ActionItem
                label="New Order"
                onPress={() => router.replace("/protected/form/create-order")}
                icon={FileText}
              />
              <ActionItem
                label="New Client"
                onPress={() => router.push("/protected/form/create-client")}
                icon={UserRoundPlus}
              />
              <ActionItem
                label="Add Inventory"
                onPress={() => router.push("/protected/form/create-stock")}
                icon={Plus}
              />
              {/* <ActionItem
                label="CRM"
                onPress={() => {
                  router.push("/protected/bg/CRM");
                }}
                icon={UserStar}
              /> */}
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.row, { justifyContent: "flex-start" }]}>
              <Text style={[Styles.med14, { color: Colors.text.black }]}>
                Today&apos;s Schedule
              </Text>
              {/* <HapticTab>
                <Text style={[Styles.reg14, { color: Colors.secondary }]}>
                  See More
                </Text>
              </HapticTab> */}
            </View>

            {/* schedules for today */}
            <View style={{ height: 120 }}>
              <AppointmentsList />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={[Styles.med14, { color: Colors.text.black }]}>
                {GetFormattedDate()}
              </Text>
              <HapticTab>
                <Text style={[Styles.reg14, { color: Colors.text.gray }]}>
                  {timeAgo}
                </Text>
              </HapticTab>
            </View>

            <StatsBoxes />
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <StatCircle
              title="Completion Rate"
              value={orderCompletionRate}
              size={GraphValue}
            />
            <StatCircle
              title="Client Satisfaction"
              value={75}
              size={GraphValue}
            />
            <StatCircle
              title="Ave. Order Value"
              value={FormatNairaShorthand(`${avgValue}`) as any}
              size={GraphValue}
              isCurrency
            />
          </View>

          <View style={[styles.section, { flex: 1, marginTop: spacing(20) }]}>
            <OverallSalesChart orders={orders} income={income} />
          </View>

          {/* <HapticTab
            style={{
              padding: spacing(10),
              backgroundColor: "red",
              borderRadius: 8,
              alignSelf: "center",
            }}
            onPress={signOut}
          >
            {loading ? (
              <ActivityIndicator size={"small"} color={"white"} />
            ) : (
              <Text style={{ color: "white" }}>Log out</Text>
            )}
          </HapticTab> */}
        </View>
      </TabImageBackground>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingVertical: spacing(30),
    gap: spacing(13),
  },
  section: {
    gap: spacing(16),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
