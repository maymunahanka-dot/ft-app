import PrimaryButton from "@/src/components/button/PrimaryButton";
import SelectClientModal from "@/src/components/form/order/SelectClientModal";
import { HapticTab } from "@/src/components/haptic-tab";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useUserImage } from "@/src/hooks/useUserImage";
import { getCurrentUserEmail } from "@/src/lib/auth-utils";
import { useDesignStore } from "@/src/stores/designSlice";
import { Client } from "@/src/types/client";
import { validateDesignForm } from "@/src/utils/formValidation";
import { formatPrice, scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronDown, ChevronLeft, Upload } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
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

const CreateDesignScreen = () => {
  const { clientId } = useLocalSearchParams<{ clientId?: string }>();
  const createDesign = useDesignStore((state) => state.createDesign);
  const loading = useDesignStore((state) => state.loading);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientModal, setClientModal] = useState(false);
  const toggleClientModal = () => setClientModal((prev) => !prev);

  const { image, pickImage } = useUserImage({
    returnBase64: true,
    maxWidth: 256,
    compress: 0.4,
  });

  useEffect(() => {
    if (image) {
      setDesignDetails((prev) => ({
        ...prev,
        imageUrl: `data:image/jpeg;base64,${image}`,
      }));
      //   console.log("image", image);
    }
  }, [image]);

  const handlePickImage = async () => {
    try {
      await pickImage();
    } catch (error) {
      console.error("error handling image", error);
    }
  };

  const [designDetails, setDesignDetails] = useState({
    imageUrl: "",
    clientId: clientId ? clientId : "",
    name: "",
    price: "",
    description: "",
    notes: "",
  });

  const [error, setError] = useState({
    imageUrl: "",
    // clientId: "",
    name: "",
    price: "",
    description: "",
    notes: "",
  });

  const handleDetailsChange = (
    field: keyof typeof designDetails,
    value: string,
  ) => {
    setDesignDetails((prev) => ({ ...prev, [field]: value }));
    if (error[field as keyof typeof error]) {
      setError((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const client = clientId
    ? clientId
    : selectedClient
      ? selectedClient.id
      : null;

  const handleCreateDesign = async () => {
    const { isValid, errors } = validateDesignForm(designDetails);
    setError(errors);
    console.log("details", isValid, error, client);
    if (!isValid || !client) return;

    try {
      const priceNum =
        parseFloat(designDetails.price.replace(/[^0-9.]/g, "")) || 0;
      await createDesign({
        userEmail: getCurrentUserEmail(),
        name: designDetails.name.trim(),
        price: priceNum,
        description: designDetails.description?.trim() || "",
        notes: designDetails.notes?.trim() || "",
        imageUrl: designDetails.imageUrl,
        clientId: client,
      });
      handleBack();
    } catch (err) {
      console.error("Error creating design", err);
    }
  };

  const handleBack = () => {
    router.replace("/(tabs)/Designs");
  };

  return (
    <>
      <View
        style={{ flex: 1, paddingTop: spacing(50), backgroundColor: "white" }}
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

          <Text style={styles.reg24}>Add New Design</Text>
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
              {!clientId && (
                <View style={Styles.inputContainer}>
                  <Text style={Styles.label}>
                    Clients<Text style={styles.red}> *</Text>
                  </Text>
                  <Pressable
                    style={[
                      Styles.input,
                      { ...styles.row, paddingVertical: 0 },
                    ]}
                    onPress={toggleClientModal}
                  >
                    {selectedClient ? (
                      <Text
                        style={[
                          Styles.reg16,
                          { color: "rgba(10, 10, 10, 0.5)" },
                        ]}
                      >
                        {selectedClient.name}
                      </Text>
                    ) : (
                      <Text
                        style={[
                          Styles.reg16,
                          { color: "rgba(10, 10, 10, 0.5)" },
                        ]}
                      >
                        Select a Client
                      </Text>
                    )}

                    <ChevronDown size={scale(20)} color={Colors.grey} />
                  </Pressable>
                </View>
              )}
              <View style={[Styles.inputContainer, { gap: spacing(12) }]}>
                <Text style={[styles.reg14]}>
                  Style Image<Text style={styles.red}> *</Text>
                </Text>

                <HapticTab style={styles.imagePicker} onPress={handlePickImage}>
                  {image ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${image}` }}
                      style={{
                        width: "100%",
                        height: styles.imagePicker.height,
                        borderRadius: styles.imagePicker.borderRadius,
                      }}
                    />
                  ) : (
                    <>
                      <View style={styles.iconWrapper}>
                        <Upload size={scale(25)} color={"#99A1AF"} />
                      </View>

                      <View
                        style={[
                          styles.col,
                          { justifyContent: "center", alignItems: "center" },
                        ]}
                      >
                        <Text style={styles.reg14}>
                          Click to upload design image
                        </Text>
                        <Text style={styles.reg12}>PNG, JPG up to 10MB</Text>
                      </View>
                    </>
                  )}
                </HapticTab>
                {error.imageUrl ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.imageUrl}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={[styles.reg14]}>
                  Design Name<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={designDetails.name}
                  onChangeText={(text) => handleDetailsChange("name", text)}
                  placeholder="e.g., Ankara Maxi Dress"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  style={[
                    Styles.input,
                    {
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
                {error.name ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.name}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={[styles.reg14]}>
                  Price (₦)<Text style={styles.red}> *</Text>
                </Text>
                <TextInput
                  value={formatPrice(designDetails.price)}
                  onChangeText={(text) => handleDetailsChange("price", text)}
                  placeholder="e.g., 85000"
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="numeric"
                  autoCorrect={false}
                  style={[
                    Styles.input,
                    {
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
                {error.price ? (
                  <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
                    {error.price}
                  </Text>
                ) : null}
              </View>

              <View style={Styles.inputContainer}>
                <Text style={[styles.reg14]}>Description</Text>
                <TextInput
                  value={designDetails.description}
                  onChangeText={(text) =>
                    handleDetailsChange("description", text)
                  }
                  placeholder="Brief description of the design..."
                  placeholderTextColor={Colors.grayText}
                  returnKeyLabel="next"
                  returnKeyType="next"
                  keyboardType="default"
                  style={[
                    Styles.input,
                    {
                      height: 80,
                      textAlignVertical: "top",
                      paddingTop: spacing(15),
                      paddingVertical: 0,
                      backgroundColor: "white",
                      paddingHorizontal: spacing(16),
                    },
                  ]}
                />
              </View>

              <View style={Styles.inputContainer}>
                <Text style={[styles.reg14]}>Notes</Text>
                <TextInput
                  value={designDetails.notes}
                  onChangeText={(text) => handleDetailsChange("notes", text)}
                  placeholder="Additional notes, client preferences, special requirements..."
                  placeholderTextColor={Colors.grayText}
                  keyboardType="default"
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

              <View style={[styles.button, { marginTop: spacing(30) }]}>
                <PrimaryButton
                  title="Create Design"
                  onPress={handleCreateDesign}
                  loading={loading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      {clientModal && (
        <SelectClientModal
          visible={clientModal}
          handleOption={(client) => {
            setSelectedClient(client);
            handleDetailsChange("clientId", client.id);
          }}
          onClose={() => setClientModal(false)}
        />
      )}
    </>
  );
};

export default CreateDesignScreen;

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
    paddingHorizontal: 16,
    gap: spacing(24),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  red: {
    color: "rgba(251, 44, 54, 1)",
  },
  imagePicker: {
    height: 150,
    gap: spacing(12),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DC",
    borderRadius: 16,
  },
  iconWrapper: {
    backgroundColor: "#F3F4F6",
    width: 63,
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 100,
  },
  button: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
