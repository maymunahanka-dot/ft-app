import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useAppointmentStore } from "@/src/stores/appointmentSlice";
import { useUserStore } from "@/src/stores/userSlice";
import { spacing } from "@/src/utils/random";
import React, { useEffect } from "react";
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
  const loading = useAppointmentStore((state) => state.loading);
  const fetchAppointments = useAppointmentStore(
    (state) => state.getAppointmentsByTailor,
  );

  const isToday = (
    dateInput: string | { seconds: number; nanoseconds: number },
  ): boolean => {
    let date: Date;

    // ✅ Firestore timestamp object
    if (typeof dateInput === "object" && "seconds" in dateInput) {
      date = new Date(dateInput.seconds * 1000);
    }
    // ✅ ISO or "YYYY-MM-DD"
    else {
      date = new Date(dateInput);
    }

    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const todaysAppointments = appointments.filter((appt) =>
    isToday(appt.createdAt),
  );

  useEffect(() => {
    if (user) {
      fetchAppointments(user.email);
      // console.log(
      //   "today aappt",
      //   appointments.filter((appt) => isToday(appt.createdAt)),
      // );
    }
  }, [user]);

  if (!todaysAppointments || todaysAppointments.length === 0) {
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
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={"small"} color={"black"} />
        </View>
      ) : (
        todaysAppointments.map((appt) => (
          <AppoinmentListItem key={appt.id} item={appt} />
        ))
      )}
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
