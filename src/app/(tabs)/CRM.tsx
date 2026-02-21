import GlassCard from "@/src/components/dashboard/boxes/GlassBox";
import FeedbackItem from "@/src/components/feedback/Item";
import { HapticTab } from "@/src/components/haptic-tab";
import CrmItem from "@/src/components/member/Item";
import BGScreenBG from "@/src/components/shared/BGScreenBG";
import { Styles } from "@/src/constants/styles";
import { Colors } from "@/src/constants/theme";
import { useCrmStore } from "@/src/stores/crmSlice";
import {
  ClientFeedback,
  getAverageRating,
  LoyaltyMember,
} from "@/src/types/crm";
import { scale, scaleFontSize, spacing } from "@/src/utils/random";
import { router } from "expo-router";
import {
  Gift,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Star,
  UsersIcon,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BOXWIDTH = SCREEN_WIDTH / 3 - 16;

const RowBoxes = () => {
  const members = useCrmStore((state) => state.loyaltyMembers);

  const clientFeedbacks = useCrmStore((state) => state.clientFeedbacks);

  return (
    <View style={styles.row}>
      <GlassCard style={styles.box}>
        <View style={[styles.startRow, { paddingBottom: spacing(12) }]}>
          <UsersIcon size={scale(15)} color={"white"} />
          <Text style={[Styles.med12, { color: "white", lineHeight: 16 }]}>
            Members
          </Text>
        </View>

        <Text style={styles.sm18}>{members.length}</Text>
      </GlassCard>

      <GlassCard style={styles.box}>
        <View style={[styles.startRow, { paddingBottom: spacing(12) }]}>
          <Star size={scale(15)} color={"white"} />
          <Text style={[Styles.med12, { color: "white", lineHeight: 16 }]}>
            Rating
          </Text>
        </View>

        <Text style={styles.sm18}>{getAverageRating(clientFeedbacks)}</Text>
      </GlassCard>

      <GlassCard style={styles.box}>
        <View style={[styles.startRow, { paddingBottom: spacing(12) }]}>
          <Mail size={scale(15)} color={"white"} />
          <Text style={[Styles.med12, { color: "white", lineHeight: 16 }]}>
            Reviews
          </Text>
        </View>

        <Text style={styles.sm18}>{clientFeedbacks.length}</Text>
      </GlassCard>
    </View>
  );
};

type TAB = "loyalty" | "feedback";

const TabsList = [
  {
    label: "Loyalty",
    icon: Gift,
    value: "loyalty",
  },
  {
    label: "Feedback",
    icon: MessageSquare,
    value: "feedback",
  },
];

const CRMScreen = () => {
  const [selectedTab, setSelectedTab] = useState<TAB>("loyalty");

  const loading = useCrmStore((state) => state.loading);
  const getLoyaltyMembers = useCrmStore((state) => state.getLoyaltyMembers);
  const getFeedBacks = useCrmStore((state) => state.getFeedBacks);

  const members = useCrmStore((state) => state.loyaltyMembers);
  const clientFeedbacks = useCrmStore((state) => state.clientFeedbacks);

  const [searchValue, setSearchValue] = useState("");

  const filteredListData = useMemo(() => {
    const q = searchValue.trim().toLowerCase();

    if (selectedTab === "loyalty") {
      return members.filter(
        (m: LoyaltyMember) =>
          q === "" ||
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q)),
      );
    }

    if (selectedTab === "feedback") {
      return clientFeedbacks.filter(
        (c: ClientFeedback) =>
          q === "" ||
          (c.productName && c.productName.toLowerCase().includes(q)) ||
          (c.clientName && c.clientName.toLowerCase().includes(q)),
      );
    }

    return [];
  }, [selectedTab, searchValue, members, clientFeedbacks]);

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([getLoyaltyMembers(), getFeedBacks()]);
    } catch (error) {
      console.error("error fetching crm data", error);
    }
  }, [getFeedBacks, getLoyaltyMembers]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View
      style={{ flex: 1, backgroundColor: "white" }}
      // edges={["top"]}
    >
      <BGScreenBG
        title="CRM"
        drawer
        subText
        text="Manage Your Customer Relationship"
        rightIcon={() => (
          <HapticTab
            style={styles.plusBtn}
            onPress={() => {
              if (selectedTab === "loyalty") {
                router.push("/protected/form/create-memeber");
                return;
              }
              router.push("/protected/form/create-feedback");
            }}
          >
            <Plus size={24} color={Colors.primary} />
          </HapticTab>
        )}
        headerChildren={RowBoxes}
        height={300}
        paddingVertical={50}
      >
        <ScrollView
          // style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, gap: spacing(32) }}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          //   scrollEnabled={false}
        >
          <View style={styles.content}>
            <View style={styles.tabs}>
              {TabsList.map((tab, index) => {
                const Icon = tab.icon;
                const isSelected = selectedTab === tab.value;
                const textStyle = isSelected
                  ? [Styles.reg14, styles.selectedText]
                  : [Styles.reg14, { color: Colors.grey }];
                const buttonStyle = isSelected
                  ? [styles.tabBtn, styles.selectedTab]
                  : [styles.tabBtn];
                return (
                  <Pressable
                    style={buttonStyle}
                    key={index}
                    onPress={() => setSelectedTab(tab.value as TAB)}
                  >
                    <Icon
                      size={scale(15)}
                      color={isSelected ? "white" : Colors.grey}
                    />
                    <Text style={textStyle}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View
              style={[
                styles.searchContainer,
                styles.startRow,
                { gap: spacing(12) },
              ]}
            >
              <Search
                size={scale(20)}
                color={"rgba(153, 161, 175, 1)"}
                strokeWidth={2}
              />
              <TextInput
                value={searchValue}
                onChangeText={setSearchValue}
                placeholder={`Search ${selectedTab}...`}
                placeholderTextColor={Colors.grey}
                style={styles.input}
              />
            </View>

            <View style={{ gap: spacing(24) }}>
              {selectedTab === "feedback" ? (
                <Text style={[Styles.reg16, { color: "rgba(16, 24, 40, 1)" }]}>
                  {clientFeedbacks.length} Reviews
                </Text>
              ) : (
                <Text style={[Styles.reg16, { color: "rgba(16, 24, 40, 1)" }]}>
                  {members.length} Loyalty Members
                </Text>
              )}
              {loading ? (
                <ActivityIndicator size={"small"} color={"black"} />
              ) : (
                <FlatList
                  data={filteredListData as any}
                  keyExtractor={(item: any) => item.id}
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    flexGrow: 1,
                    gap: spacing(16),
                    paddingBottom: spacing(40),
                  }}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  renderItem={({ item }: { item: any }) => {
                    if (selectedTab === "loyalty") {
                      return <CrmItem item={item} />;
                    }

                    return <FeedbackItem item={item} />;
                  }}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                      <Text
                        style={[Styles.med12, { color: Colors.text.gray }]}
                      >{`No ${selectedTab} found.`}</Text>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </BGScreenBG>
    </View>
  );
};

export default CRMScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing(15),
    paddingVertical: spacing(26),
  },
  plusBtn: {
    width: 40,
    aspectRatio: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: BOXWIDTH,
    height: 100,
    padding: spacing(16),
  },
  startRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: spacing(4),
  },
  sm18: {
    fontFamily: "semibold",
    fontSize: scaleFontSize(20),
    lineHeight: 28,
    color: "white",
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing(12),
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing(8),
    backgroundColor: "white",
  },
  selectedTab: {
    backgroundColor: Colors.primary,
  },
  selectedText: {
    color: "white",
  },
  searchContainer: {
    backgroundColor: "rgba(249, 250, 251, 1)",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 1)",
    borderRadius: 14,
    paddingVertical: spacing(12),
    paddingHorizontal: spacing(16),
  },
  input: {
    flex: 1,
    // backgroundColor: "red",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
