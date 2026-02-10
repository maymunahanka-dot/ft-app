import PrimaryButton from "@/src/components/button/PrimaryButton";
import SelectClientModal from "@/src/components/form/order/SelectClientModal";
import { HapticTab } from "@/src/components/haptic-tab";
import SelectFilterModal from "@/src/components/shared/modal/SelectFilterModal";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useAppointmentStore } from "@/src/stores/appointmentSlice";
import { useClientStore } from "@/src/stores/clientSlice";
import { Appointment } from "@/src/types/appointment";
import { Client } from "@/src/types/client";
import {
  CapitalizeFirstName,
  GetDetailedDate,
  GetDetailedTime,
  numberize,
  scale,
  scaleFontSize,
  spacing,
} from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar, ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { SafeAreaView } from "react-native-safe-area-context";

const PurposeList = [
  {
    label: "Consultation",
    value: "consultation",
  },
  {
    label: "Measurement",
    value: "measurement",
  },
  {
    label: "Fitting",
    value: "fitting",
  },
  {
    label: "Delivery",
    value: "delivery",
  },
  {
    label: "Alteration",
    value: "alteration",
  },
];

const apptStatusList = [
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];

const EditAppointmentScreen = () => {
  const { id } = useLocalSearchParams();
  const appointments = useAppointmentStore((state) => state.appointments);
  const foundAppointment = appointments.find(
    (prev) => prev.id === id.toString(),
  )!;

  const loading = useAppointmentStore((state) => state.loading);
  const editAppointment = useAppointmentStore((state) => state.editAppoinment);

  const clients = useClientStore((state) => state.clients);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(
    clients.find((prev) => prev.phone === foundAppointment.clientPhone),
  );

  console.log("found client", foundAppointment?.clientPhone);

  const [clientModal, setClientModal] = useState(false);
  const toggleClientModal = () => setClientModal((prev) => !prev);
  const [purposeModal, setPurposeModal] = useState(false);
  const togglePurposeModal = () => setPurposeModal((prev) => !prev);
  const [statusModal, setStatusModal] = useState(false);
  const toggleStatusModal = () => setStatusModal((prev) => !prev);

  const [datePickerFor, setDatePickerFor] = useState<"date" | "time" | null>(
    null,
  );

  const [data, setData] = useState<Appointment>({
    id: foundAppointment.id,
    clientName: selectedClient?.name ?? "",
    clientPhone: selectedClient?.phone ?? "",
    clientId: selectedClient?.id ?? "",
    date: foundAppointment.date,
    service: foundAppointment?.service
      ? foundAppointment.service
      : foundAppointment.purpose,
    purpose: foundAppointment?.purpose
      ? foundAppointment.purpose
      : foundAppointment.service,
    status: foundAppointment.status,
    notes: foundAppointment.notes ?? "",
    duration: foundAppointment.duration,
    userEmail: foundAppointment.userEmail,
    createdAt: foundAppointment.createdAt,
    updatedAt: foundAppointment.updatedAt,
  });

  const [error, setError] = useState({
    clientName: "",
    clientPhone: "",
    clientId: "",
    date: "",
    time: "",
    type: "",
    status: "",
    notes: "",
    duration: "",
  });

  const handleDataChange = (
    field: keyof typeof data,
    value: string | number,
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateAppointmentForm = () => {
    const newErrors = {
      clientName: "",
      clientPhone: "",
      clientId: "",
      date: "",
      time: "",
      type: "",
      status: "",
      notes: "",
      duration: "",
    };

    let isValid = true;

    // Client
    if (!data.clientId) {
      newErrors.clientId = "Client is required";
      isValid = false;
    }

    if (!data.clientName.trim()) {
      newErrors.clientName = "Client name is required";
      isValid = false;
    }

    if (!data.clientPhone.trim()) {
      newErrors.clientPhone = "Client phone is required";
      isValid = false;
    }

    // Date
    if (!data.date) {
      newErrors.date = "Appointment date is required";
      isValid = false;
    }

    // Duration
    if (!data.duration || data.duration < 1) {
      newErrors.duration = "Duration must be at least 1 hour";
      isValid = false;
    }

    // Update error state once
    setError(newErrors);

    return isValid;
  };

  const handleEditAppointmen = async () => {
    const isValid = validateAppointmentForm();
    if (!isValid) return;

    try {
      await editAppointment(data.id, data);
      handleBack();
    } catch (err) {
      console.error("Failed to create appointment", err);
    }
  };

  const handleBack = () => {
    router.replace("/(tabs)/Appointments");
  };

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, paddingTop: spacing(20), backgroundColor: "white" }}
      >
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
              color={"rgba(54, 65, 83, 1)"}
              strokeWidth={1.5}
            />
          </HapticTab>

          <Text style={styles.reg24}>Edit Appointment</Text>
        </View>

        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: "white",
          }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={
            Platform.OS === "ios" ? spacing(50) : spacing(0)
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingVertical: spacing(30),
            }}
            keyboardDismissMode="interactive"
          >
            <View style={styles.content}>
              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Clients</Text>
                <Pressable
                  style={[Styles.input, { ...styles.row, paddingVertical: 0 }]}
                  onPress={toggleClientModal}
                >
                  {selectedClient ? (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 0.5)" }]}
                    >
                      {selectedClient.name}
                    </Text>
                  ) : (
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 0.5)" }]}
                    >
                      Select a Client
                    </Text>
                  )}

                  <ChevronDown size={scale(20)} color={Colors.grey} />
                </Pressable>
              </View>

              <View style={[styles.row, { gap: spacing(20) }]}>
                <View
                  style={[Styles.inputContainer, { gap: spacing(8), flex: 1 }]}
                >
                  <Text style={[Styles.label]}>
                    Date<Text style={styles.red}> *</Text>
                  </Text>
                  <Pressable
                    style={styles.datePicker}
                    onPress={() => setDatePickerFor("date")}
                  >
                    {data.date ? (
                      <Text
                        style={[Styles.reg12, { color: "rgba(10, 10, 10, 1)" }]}
                      >
                        {GetDetailedDate(data.date)}
                      </Text>
                    ) : (
                      <Text style={styles.reg12}>DD/MM/YYYY</Text>
                    )}
                    <Calendar size={scale(15)} color={Colors.grey} />
                  </Pressable>
                  {error.date ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.date}
                    </Text>
                  ) : null}
                </View>

                <View
                  style={[Styles.inputContainer, { gap: spacing(8), flex: 1 }]}
                >
                  <Text style={[Styles.label]}>
                    Time<Text style={styles.red}> *</Text>
                  </Text>
                  <Pressable
                    style={styles.datePicker}
                    onPress={() => setDatePickerFor("time")}
                  >
                    {data.date ? (
                      <Text
                        style={[Styles.reg12, { color: "rgba(10, 10, 10, 1)" }]}
                      >
                        {GetDetailedTime(data.date)}
                      </Text>
                    ) : (
                      <Text style={styles.reg12}>00:00</Text>
                    )}
                    <Calendar size={scale(15)} color={Colors.grey} />
                  </Pressable>
                  {error.time ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.time}
                    </Text>
                  ) : null}
                </View>
              </View>

              {(datePickerFor === "date" || datePickerFor === "time") && (
                <DatePicker
                  modal
                  open={!!datePickerFor}
                  date={
                    datePickerFor === "date" && data.date
                      ? new Date(data.date)
                      : datePickerFor === "time" && data.date
                        ? new Date(data.date)
                        : new Date()
                  }
                  mode={datePickerFor}
                  onConfirm={(date) => {
                    const value = date.toISOString();
                    console.log(datePickerFor, date);
                    if (datePickerFor === "date") {
                      handleDataChange("date", value);
                    } else {
                      handleDataChange("date", value);
                    }
                    setDatePickerFor(null);
                  }}
                  onCancel={() => setDatePickerFor(null)}
                />
              )}

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>
                  Purpose<Text style={styles.red}> *</Text>
                </Text>
                <Pressable
                  style={[Styles.input, { ...styles.row, paddingVertical: 0 }]}
                  onPress={togglePurposeModal}
                >
                  <Text
                    style={[Styles.reg16, { color: "rgba(10, 10, 10, 1)" }]}
                  >
                    {CapitalizeFirstName(data.service)}
                  </Text>

                  <ChevronDown size={scale(20)} color={Colors.grey} />
                </Pressable>
              </View>

              <View style={[styles.row, { gap: spacing(20) }]}>
                <View style={[Styles.inputContainer, { flex: 1 }]}>
                  <Text style={Styles.label}>
                    Duration (hr)<Text style={styles.red}> *</Text>
                  </Text>

                  <TextInput
                    value={data.duration === 0 ? "" : data.duration.toString()}
                    onChangeText={(text) =>
                      handleDataChange("duration", numberize(text))
                    }
                    placeholder="2"
                    placeholderTextColor={Colors.grayText}
                    returnKeyLabel="next"
                    returnKeyType="next"
                    autoCorrect={false}
                    style={[
                      Styles.input,
                      {
                        paddingVertical: 0,
                        backgroundColor: "white",
                        paddingHorizontal: spacing(16),
                      },
                    ]}
                    keyboardType="number-pad"
                  />
                  {error.duration ? (
                    <Text
                      style={{ ...Styles.reg12, color: "red", marginTop: 4 }}
                    >
                      {error.duration}
                    </Text>
                  ) : null}
                </View>

                <View style={[Styles.inputContainer, { flex: 1 }]}>
                  <Text style={Styles.label}>Status</Text>
                  <Pressable
                    style={[
                      Styles.input,
                      { ...styles.row, paddingVertical: 0 },
                    ]}
                    onPress={toggleStatusModal}
                  >
                    <Text
                      style={[Styles.reg16, { color: "rgba(10, 10, 10, 1)" }]}
                    >
                      {CapitalizeFirstName(data.status)}
                    </Text>

                    <ChevronDown size={scale(20)} color={Colors.grey} />
                  </Pressable>
                </View>
              </View>

              <View style={Styles.inputContainer}>
                <Text style={Styles.label}>Notes</Text>
                <TextInput
                  value={data.notes}
                  onChangeText={(text) => handleDataChange("notes", text)}
                  placeholder="Add any additional notes..."
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  autoCorrect={false}
                  multiline
                  numberOfLines={20}
                  style={[
                    Styles.input,
                    {
                      height: 100,
                      textAlignVertical: "top",
                      paddingTop: spacing(15),
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
              </View>

              <View style={styles.button}>
                <PrimaryButton
                  title="Edit Appoinment"
                  onPress={handleEditAppointmen}
                  loading={loading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {clientModal && (
        <SelectClientModal
          visible={clientModal}
          handleOption={(client) => {
            setSelectedClient(client);
            setData((prev) => ({
              ...prev,
              clientId: client.id,
              clientName: client.name,
              clientPhone: client.phone,
            }));
          }}
          onClose={() => setClientModal(false)}
        />
      )}
      {purposeModal && (
        <SelectFilterModal
          data={PurposeList}
          visible={purposeModal}
          handleOption={(option) => {
            handleDataChange("service", option);
            handleDataChange("purpose", option);
          }}
          selected={data.service}
          onClose={() => setPurposeModal(false)}
        />
      )}
      {statusModal && (
        <SelectFilterModal
          data={apptStatusList}
          visible={statusModal}
          handleOption={(option) => handleDataChange("status", option)}
          selected={data.status}
          onClose={() => setStatusModal(false)}
        />
      )}
    </>
  );
};

export default EditAppointmentScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: spacing(8),
  },
  col: {
    gap: spacing(4),
  },
  reg12: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
    color: "#99A1AF",
  },
  reg14: {
    fontFamily: "regular",
    fontSize: scaleFontSize(14),
    color: "#4A5565",
  },
  reg24: {
    fontFamily: "regular",
    fontSize: scaleFontSize(24),
    color: "rgba(54, 65, 83, 1)",
    lineHeight: 32,
  },
  reg30: {
    fontFamily: "regular",
    fontSize: scaleFontSize(30),
    color: "white",
    lineHeight: 36,
  },
  content: {
    flex: 1,
    // paddingVertical: spacing(20),
    paddingHorizontal: 16,
    gap: spacing(14),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gapRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(14),
  },
  red: {
    color: "rgba(251, 44, 54, 1)",
  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing(15),
    paddingHorizontal: spacing(13),
    height: 50,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
  },
  detailBox: {
    backgroundColor: "rgba(239, 246, 255, 1)",
    padding: spacing(17),
    borderWidth: 1.1,
    borderColor: "rgba(190, 219, 255, 1)",
    borderRadius: 16,
    gap: spacing(12),
  },
  summaryBox: {
    marginTop: spacing(10),
    backgroundColor: "rgba(254, 230, 133, 0.3)",
    padding: spacing(17),
    borderWidth: 1.1,
    borderRadius: 16,
    borderColor: "rgba(254, 230, 133, 0.3)",
    gap: spacing(10),
  },
  button: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
