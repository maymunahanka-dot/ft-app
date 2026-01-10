import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useAppointmentStore } from "@/src/stores/appointmentSlice";
import { useUserStore } from "@/src/stores/userSlice";
import { spacing } from "@/src/utils/random";
import React, { Suspense, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppoinmentListItem from "./appoinmentListItem";

const AppointmentsList = () => {
  const user = useUserStore((state) => state.user);

  const appointments = useAppointmentStore((state) => state.appointments);
  //   const loading = useAppointmentStore((state) => state.loading);
  const fetchAppointments = useAppointmentStore(
    (state) => state.getAppointmentsByTailor
  );

  useEffect(() => {
    if (user) {
      fetchAppointments(user.email);
    }
  }, [user]);

  if (!appointments || appointments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No appointments today</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      horizontal
      contentContainerStyle={styles.scrollContainer}
    >
      <Suspense fallback={<ActivityIndicator size={"small"} color={"black"} />}>
        {appointments.map((appt, index) => (
          <AppoinmentListItem key={index} item={appt} />
        ))}
      </Suspense>
    </ScrollView>
  );
};

export default AppointmentsList;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    gap: spacing(15),
  },
  emptyContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  emptyText: {
    ...Styles.reg14,
    color: Colors.text.gray,
  },
});
