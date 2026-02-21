import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { create } from "zustand";
import { db } from "../context/firebase";
import { getCurrentUserEmail } from "../lib/auth-utils";
import { ClientFeedback, EmailCampaign, LoyaltyMember } from "../types/crm";

interface CrmState {
  loyaltyMembers: LoyaltyMember[];
  clientFeedbacks: ClientFeedback[];
  campaigns: EmailCampaign[];
  loading: boolean;
  getLoyaltyMembers: () => Promise<void>;
  addLoyaltyMember: (member: Omit<LoyaltyMember, "id">) => Promise<boolean>;
  editLoyaltyMember: (
    id: string,
    updatedData: LoyaltyMember,
  ) => Promise<boolean>;
  deleteMemeber: (id: string) => Promise<boolean>;

  // feedback
  getFeedBacks: () => Promise<void>;
  addFeeback: (feedback: Omit<ClientFeedback, "id">) => Promise<boolean>;
  editFeedback: (id: string, updatedData: ClientFeedback) => Promise<boolean>;
  replyToFeedback: (id: string, reply: string) => Promise<boolean>;
  updateFeedbackReply: (id: string, reply: string) => Promise<boolean>;
  deleteFeedback: (id: string) => Promise<boolean>;
}

const loyaltyMembersCollection = collection(db, "loyaltyMembers");
const feedbackCollection = collection(db, "feedback");

export const useCrmStore = create<CrmState>((set, get) => ({
  loyaltyMembers: [],
  clientFeedbacks: [],
  campaigns: [],
  loading: false,
  async getLoyaltyMembers() {
    set({ loading: true });
    try {
      const userEmail = getCurrentUserEmail();

      const q = query(
        loyaltyMembersCollection,
        where("tailorId", "==", userEmail),
      );

      const snapshot = await getDocs(q);
      const members = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as LoyaltyMember,
      );
      set({
        loyaltyMembers: members.sort(
          (a, b) => (b.points || 0) - (a.points || 0),
        ),
      });
      console.log("loyalty", members.length);
    } catch (error) {
      console.error("Error fetching loyalty members:", error);
    } finally {
      set({ loading: false });
    }
  },

  async addLoyaltyMember(member) {
    set({ loading: true });
    try {
      const userEmail = getCurrentUserEmail();

      const newMember: LoyaltyMember = {
        ...member,
        tailorId: userEmail,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log("hit in action", JSON.stringify(newMember, null, 2));

      await addDoc(loyaltyMembersCollection, newMember);
      await get().getLoyaltyMembers();
      return true;
    } catch (error) {
      console.error("Error adding loyalty member:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  async editLoyaltyMember(id, updatedData) {
    set({ loading: true });
    try {
      const memberRef = doc(db, "loyaltyMembers", id);
      await updateDoc(memberRef, {
        ...updatedData,
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error("Error editing loyalty member:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  async deleteMemeber(id) {
    set({ loading: true });
    try {
      const memberRef = doc(db, "loyaltyMembers", id);
      await deleteDoc(memberRef);
      return true;
    } catch (error) {
      console.error("Error deleting loyalty member:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  async getFeedBacks() {
    try {
      const userEmail = getCurrentUserEmail();

      const q = query(feedbackCollection, where("tailorId", "==", userEmail));

      const snapshot = await getDocs(q);
      const feedbacks = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as ClientFeedback,
      );
      set({
        clientFeedbacks: feedbacks.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        }),
      });
    } catch (error) {
      console.error("Error getting feedbacks", error);
      return;
    } finally {
      set({ loading: false });
    }
  },
  async addFeeback(feedback) {
    set({ loading: true });
    try {
      const userEmail = getCurrentUserEmail();

      const newFeeback: ClientFeedback = {
        ...feedback,
        tailorId: userEmail,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(feedbackCollection, newFeeback);
      await get().getFeedBacks();
      return true;
    } catch (error) {
      console.error("Error adding feedbacks:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  async editFeedback(id, updatedData) {
    set({ loading: true });
    try {
      const feedbackRef = doc(db, "feedback", id);
      await updateDoc(feedbackRef, {
        ...updatedData,
        updatedAt: Timestamp.now(),
      });

      console.log("hit in action", JSON.stringify(updatedData, null, 2));
      await get().getFeedBacks();
      return true;
    } catch (error) {
      console.error("Error editing feedback:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  async replyToFeedback(id, reply) {
    set({ loading: true });
    try {
      const feedbackRef = doc(db, "feedback", id);
      await updateDoc(feedbackRef, {
        reply,
        repliedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await get().getFeedBacks();
      return true;
    } catch (error) {
      console.error("Error replying to feedback:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  async updateFeedbackReply(id, reply) {
    set({ loading: true });
    try {
      const feedbackRef = doc(db, "feedback", id);
      await updateDoc(feedbackRef, {
        reply,
        updatedAt: Timestamp.now(),
      });
      await get().getFeedBacks();
      return true;
    } catch (error) {
      console.error("Error editing reply feedback:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  async deleteFeedback(id) {
    set({ loading: true });
    try {
      const feedbackref = doc(db, "feedback", id);
      await deleteDoc(feedbackref);
      await get().getFeedBacks();
      return true;
    } catch (error) {
      console.error("Error deleting feedback:", error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
