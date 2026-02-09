import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { getCurrentUserId } from "../lib/auth-utils";
import { EmailCampaign, LoyaltyMember } from "../types/crm";

interface CrmState {
  loyaltyMembers: LoyaltyMember[];
  campaigns: EmailCampaign[];
  loading: boolean;
  getLoyaltyMembers: () => Promise<void>;
  addLoyaltyMember: (member: Omit<LoyaltyMember, "id">) => Promise<void>;
  getCampaigns: () => Promise<void>;
  addCampaign: (campaign: Omit<EmailCampaign, "id">) => Promise<void>;
}

// Collection references
const loyaltyMembersCollection = collection(db, "loyaltyMembers");
// const rewardsCollection = collection(db, "rewards");
const campaignsCollection = collection(db, "campaigns");
// const templatesCollection = collection(db, "templates");
// const feedbackCollection = collection(db, "feedback");

export const useCrmStore = create<CrmState>((set, get) => ({
  loyaltyMembers: [],
  campaigns: [],
  loading: false,
  async getLoyaltyMembers() {
    set({ loading: true });
    try {
      const userId = getCurrentUserId();

      const q = query(
        loyaltyMembersCollection,
        where("tailorId", "==", userId),
        orderBy("points", "desc"),
      );
      const snapshot = await getDocs(q);
      const members = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as LoyaltyMember,
      );
      set({ loyaltyMembers: members });
    } catch (error) {
      console.error("Error fetching loyalty members:", error);
    } finally {
      set({ loading: false });
    }
  },

  async addLoyaltyMember(member: Omit<LoyaltyMember, "id">) {
    set({ loading: true });
    try {
      const userId = getCurrentUserId();

      const newMemberRef = await addDoc(loyaltyMembersCollection, {
        ...member,
        tailorId: userId,
      });
      const newMember: LoyaltyMember = {
        id: newMemberRef.id,
        ...member,
      };

      set((state) => ({
        loyaltyMembers: state.loyaltyMembers.some((i) => i.id === newMember.id)
          ? state.loyaltyMembers.map((i) =>
              i.id === newMember.id ? newMember : i,
            )
          : [newMember, ...state.loyaltyMembers],
      }));
    } catch (error) {
      console.error("Error adding loyalty member:", error);
    } finally {
      set({ loading: false });
    }
  },
  async getCampaigns() {
    set({ loading: true });
    try {
      const userId = getCurrentUserId();

      const q = query(
        campaignsCollection,
        where("tailorId", "==", userId),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const campaigns = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as EmailCampaign,
      );
      set({ campaigns });
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      set({ loading: false });
    }
  },

  async addCampaign(campaign) {
    set({ loading: true });
    try {
      const userId = getCurrentUserId();

      const newCampaignRef = await addDoc(campaignsCollection, {
        ...campaign,
        tailorId: userId,
      });

      const newCampaign: EmailCampaign = {
        id: newCampaignRef.id,
        ...campaign,
      };

      set((state) => ({
        campaigns: state.campaigns.some((i) => i.id === newCampaign.id)
          ? state.campaigns.map((i) =>
              i.id === newCampaign.id ? newCampaign : i,
            )
          : [newCampaign, ...state.campaigns],
      }));
    } catch (error) {
      console.error("Error adding campaign:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
