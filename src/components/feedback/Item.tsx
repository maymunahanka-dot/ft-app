import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useCrmStore } from "@/src/stores/crmSlice";
import { ClientFeedback } from "@/src/types/crm";
import {
  CapitalizeFirstName,
  FormatOrderDate,
  scale,
  scaleFontSize,
  ShowToastMessage,
  spacing,
} from "@/src/utils/random";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { MessageSquare } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { HapticTab } from "../haptic-tab";
import { formatFirestoreTimestampToISO } from "../invoice/util";

const { width } = Dimensions.get("window");

type StarRatingProps = {
  rating: number; // 0-5
  size?: number;
};

const StarRating = ({ rating, size = 24 }: StarRatingProps) => {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name={i < rating ? "star" : "star-outline"}
          size={size}
          color={i < rating ? "rgba(240, 177, 0, 1)" : "black"}
        />
      ))}
    </View>
  );
};

type inputProps = {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  toggleEditModal: () => void;
  onUpdate: () => Promise<void>;
  loading: boolean;
};

const EditReplyInput = ({
  value,
  setValue,
  toggleEditModal,
  onUpdate,
  loading,
}: inputProps) => {
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!value.trim()) {
      setError("A reply is required");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    try {
      await onUpdate();
    } catch (error) {
      console.error("error in handleUpdate", error);
    }
  };

  return (
    <View style={styles.editInput}>
      <View style={Styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Type your reply...."
          placeholderTextColor={Colors.grayText}
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
        {error ? (
          <Text style={{ ...Styles.reg12, color: "red", marginTop: 4 }}>
            {error}
          </Text>
        ) : null}
      </View>
      <View style={styles.editBtns}>
        <HapticTab
          style={styles.cancelBtn}
          onPress={toggleEditModal}
          disabled={loading}
        >
          <Text style={[Styles.reg14, { color: "white", textAlign: "center" }]}>
            Cancel
          </Text>
        </HapticTab>

        <HapticTab
          style={styles.updateBtn}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size={"small"} color={"white"} />
          ) : (
            <Text
              style={[Styles.reg14, { color: "white", textAlign: "center" }]}
            >
              Send
            </Text>
          )}
        </HapticTab>
      </View>
    </View>
  );
};

type Props = {
  item: ClientFeedback;
};

const FeedbackItem = ({ item }: Props) => {
  const loading = useCrmStore((state) => state.loading);
  const replyToFeedback = useCrmStore((state) => state.replyToFeedback);
  const updateFeedbackReply = useCrmStore((state) => state.updateFeedbackReply);

  const [value, setValue] = useState(item?.reply ?? "");

  const [edit, setEdit] = useState(false);
  const toggleEditModal = () => setEdit((prev) => !prev);

  const onUpdate = async () => {
    const isEdit = !!item.reply;
    if (!item?.id) return;
    try {
      if (isEdit) {
        const success = await updateFeedbackReply(item.id, value);
        if (success) {
          ShowToastMessage({
            title: "Reply updated successfully",
            preset: "done",
            from: "top",
          });
          toggleEditModal();
        }
      } else {
        const success = await replyToFeedback(item.id, value);
        if (success) {
          ShowToastMessage({
            title: "Reply added successfully",
            preset: "done",
            from: "top",
          });
          toggleEditModal();
        }
      }
    } catch (error) {
      console.error("error in onUpdate", error);
    }
  };

  return (
    <HapticTab
      style={styles.container}
      onPress={() => {
        if (!item.id) {
          console.log("item id", item.id);
          return;
        }
        router.push({
          pathname: "/protected/feedback/[id]",
          params: {
            id: item?.id ?? "",
          },
        });
      }}
    >
      <View
        style={[styles.row, { gap: spacing(20), alignItems: "flex-start" }]}
      >
        <LinearGradient
          colors={["rgba(22, 152, 141, 1)", "rgba(13, 107, 98, 1)"]}
          style={styles.iconWrapper}
        >
          <Text
            style={{
              fontFamily: "regular",
              fontSize: scaleFontSize(18),
              color: "white",
            }}
          >
            {item.clientName.split("")[0].toUpperCase()}
          </Text>
        </LinearGradient>
        <View style={styles.content}>
          <View style={[styles.row, { gap: spacing(20) }]}>
            <View style={[styles.colText]}>
              <Text
                style={[
                  Styles.reg14,
                  { color: "rgba(10, 10, 10, 1)", flexShrink: 1 },
                ]}
                numberOfLines={1}
              >
                {item.clientName}
              </Text>
              <StarRating rating={item.rating} size={16} />
            </View>

            <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
              {" "}
              {FormatOrderDate(
                new Date(
                  formatFirestoreTimestampToISO(item.createdAt),
                ).toDateString(),
                false,
              )}
            </Text>
          </View>
          <Text
            style={[
              Styles.reg14,
              { color: "rgba(54, 65, 83, 1)", flexShrink: 1 },
            ]}
          >
            {item.comment}
          </Text>

          <Text style={[Styles.reg12, { color: "rgba(106, 114, 130, 1)" }]}>
            Service: {CapitalizeFirstName(item.productName)}
          </Text>
          {!edit && item.reply ? (
            <View style={styles.resBox}>
              <Text style={[Styles.reg12, { color: "rgba(74, 85, 101, 1)" }]}>
                Your Response:
              </Text>
              <View style={[styles.gapRow, { alignItems: "flex-end" }]}>
                <Text
                  style={[
                    Styles.reg14,
                    { color: "rgba(16, 24, 40, 1)", flex: 1, flexShrink: 1 },
                  ]}
                >
                  {CapitalizeFirstName(item.reply)}
                </Text>
                <HapticTab hitSlop={20} onPress={toggleEditModal}>
                  <Text
                    style={[Styles.reg14, { color: "rgba(22, 152, 141, 1)" }]}
                  >
                    Edit
                  </Text>
                </HapticTab>
              </View>
            </View>
          ) : (
            <HapticTab
              style={[styles.gapRow, { gap: spacing(5) }]}
              hitSlop={20}
              onPress={toggleEditModal}
            >
              <MessageSquare size={scale(16)} color={Colors.primary} />
              <Text style={[Styles.reg14, { color: Colors.primary }]}>
                Reply
              </Text>
            </HapticTab>
          )}
        </View>
      </View>
      {edit && (
        <EditReplyInput
          value={value}
          setValue={setValue}
          toggleEditModal={toggleEditModal}
          onUpdate={onUpdate}
          loading={loading}
        />
      )}
    </HapticTab>
  );
};

export default FeedbackItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(249, 250, 251, 1)",
    padding: spacing(16),
    borderWidth: 0.2,
    borderRadius: 16,
    borderColor: "rgba(74, 85, 101, 1)",
  },
  gapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(12),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrapper: {
    width: 48,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  colText: {
    flexShrink: 1,
    gap: spacing(4),
  },
  content: {
    flex: 1,
    flexShrink: 1,
    gap: spacing(8),
  },
  resBox: {
    flexShrink: 1,
    backgroundColor: "rgba(232, 245, 244, 1)",
    padding: spacing(12),
    gap: spacing(5),
    borderRadius: 14,
  },
  editInput: {
    marginTop: spacing(20),
    paddingHorizontal: spacing(10),
    paddingVertical: spacing(12),
    gap: spacing(15),
    borderRadius: 14,
  },
  editBtns: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing(10),
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.black,
    padding: spacing(12),
    borderRadius: 10,
  },
  updateBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: spacing(12),
    borderRadius: 10,
  },
});
