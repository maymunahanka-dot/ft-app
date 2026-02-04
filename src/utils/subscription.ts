import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../context/firebase";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type SubscriptionType = "trial" | "paid" | "free";

export type SubscriptionResult = {
  isSubscribed: boolean;
  planType?: string;
  subscriptionType?: SubscriptionType;
  subscriptionEndDate?: string;
  paymentAmount?: number;
  paymentDate?: string;
};

type UserDocData = {
  subscriptionType?: SubscriptionType;
  planType?: string;
  isTrialActive?: boolean;
  subscriptionEndDate?: string;
  payment_amount?: number;
  payment_date?: string;
  isSubscribed?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                              CORE CHECK LOGIC                               */
/* -------------------------------------------------------------------------- */

export async function checkSubscriptionStatus(
  email?: string,
  uuid?: string,
): Promise<SubscriptionResult> {
  try {
    if (!email && !uuid) {
      return { isSubscribed: false, subscriptionType: "free" };
    }

    if (!db) {
      // Mobile safety: fail open if DB not ready
      return getFallbackAccess();
    }

    // 1️⃣ Global kill switch
    const settingsSnap = await getDoc(
      doc(db, "system_settings", "subscription"),
    );

    if (
      settingsSnap.exists() &&
      settingsSnap.data()?.subscriptionsEnabled === false
    ) {
      return getFallbackAccess();
    }

    // 2️⃣ Admin delegation
    let effectiveEmail = email;

    if (email) {
      const adminSnap = await getDocs(
        query(
          collection(db, "fashiontally_admins"),
          where("email", "==", email),
        ),
      );

      if (!adminSnap.empty) {
        const adminData = adminSnap.docs[0].data();
        if (adminData?.invitedBy) {
          effectiveEmail = adminData.invitedBy;
        }
      }
    }

    // 3️⃣ Resolve user document
    const userSnap = await findUserDoc(effectiveEmail, uuid);
    if (!userSnap) {
      return { isSubscribed: false, subscriptionType: "free" };
    }

    const userData = userSnap.data() as UserDocData;

    return evaluateSubscription(userData);
  } catch {
    // Never crash mobile UI
    return { isSubscribed: false, subscriptionType: "free" };
  }
}

/* -------------------------------------------------------------------------- */
/*                          SUBSCRIPTION EVALUATION                            */
/* -------------------------------------------------------------------------- */

function evaluateSubscription(data: UserDocData): SubscriptionResult {
  const {
    subscriptionType,
    planType,
    isTrialActive,
    subscriptionEndDate,
    payment_amount,
    payment_date,
    isSubscribed,
  } = data;

  // 🧪 Trial
  if (subscriptionType === "trial" && isTrialActive && subscriptionEndDate) {
    if (isFutureDate(subscriptionEndDate)) {
      return {
        isSubscribed: true,
        subscriptionType: "trial",
        planType: planType ?? "Starter",
        subscriptionEndDate,
      };
    }

    return { isSubscribed: false, subscriptionType: "free", planType: "Free" };
  }

  // 💳 Legacy paid (30 days)
  if (payment_amount && payment_amount > 0 && payment_date) {
    const active = getDaysSince(payment_date) <= 30;

    return {
      isSubscribed: active,
      subscriptionType: "paid",
      planType: determinePlanType(payment_amount),
      paymentAmount: payment_amount,
      paymentDate: payment_date,
    };
  }

  // 🆕 New paid fields
  if (
    isSubscribed &&
    subscriptionEndDate &&
    isFutureDate(subscriptionEndDate)
  ) {
    return {
      isSubscribed: true,
      subscriptionType: subscriptionType ?? "paid",
      planType: planType ?? "Starter",
      subscriptionEndDate,
    };
  }

  return { isSubscribed: false, subscriptionType: "free", planType: "Free" };
}

/* -------------------------------------------------------------------------- */
/*                             FIRESTORE HELPERS                               */
/* -------------------------------------------------------------------------- */

async function findUserDoc(
  email?: string,
  uuid?: string,
): Promise<DocumentSnapshot | null> {
  if (!db) return null;

  if (email) {
    const emailRef = doc(db, "fashiontally_users", email);
    const snap = await getDoc(emailRef);
    if (snap.exists()) return snap;
  }

  if (uuid) {
    const uuidRef = doc(db, "fashiontally_users", uuid);
    const snap = await getDoc(uuidRef);
    if (snap.exists()) return snap;
  }

  return null;
}

// async function resolveUserDocRef(
//   email?: string,
//   uuid?: string,
// ): Promise<{ ref: DocumentReference; keyType: "email" | "uuid" } | null> {
//   if (!db) return null;

//   if (email) {
//     const ref = doc(db, "fashiontally_users", email);
//     const snap = await getDoc(ref);
//     if (snap.exists()) return { ref, keyType: "email" };
//   }

//   if (uuid) {
//     const ref = doc(db, "fashiontally_users", uuid);
//     const snap = await getDoc(ref);
//     if (snap.exists()) return { ref, keyType: "uuid" };
//   }

//   return null;
// }

/* -------------------------------------------------------------------------- */
/*                               UTIL FUNCTIONS                                */
/* -------------------------------------------------------------------------- */

const isFutureDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date > new Date();
};

const getDaysSince = (dateStr: string): number => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return Infinity;

  const diff = Date.now() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const getFallbackAccess = (): SubscriptionResult => ({
  isSubscribed: true,
  subscriptionType: "paid",
  planType: "All Access",
});

const determinePlanType = (amount: number): string => {
  if (amount >= 25000) return "PROFESSIONAL";
  if (amount >= 15000) return "GROWTH";
  if (amount >= 10000) return "STARTER";
  return "Free";
};

// /* -------------------------------------------------------------------------- */
// /*                          TEST / DEV SUBSCRIPTION                             */
// /* -------------------------------------------------------------------------- */

// export async function addTestSubscription(
//   email?: string,
//   uuid?: string,
//   options?: {
//     planType?: string;
//     subscriptionType?: SubscriptionType;
//     daysValid?: number;
//   },
// ): Promise<boolean> {
//   const resolved = await resolveUserDocRef(email, uuid);
//   if (!resolved) return false;

//   const endDate = new Date();
//   endDate.setDate(endDate.getDate() + (options?.daysValid ?? 30));

//   await updateDoc(resolved.ref, {
//     isSubscribed: true,
//     subscriptionType: options?.subscriptionType ?? "paid",
//     planType: options?.planType ?? "Growth",
//     subscriptionEndDate: endDate.toISOString(),
//     isTrialActive: options?.subscriptionType === "trial",
//     payment_amount: options?.subscriptionType === "paid" ? 10000 : null,
//     payment_date:
//       options?.subscriptionType === "paid" ? new Date().toISOString() : null,
//     updatedAt: new Date().toISOString(),
//   });

//   return true;
// }

// export async function removeTestSubscription(
//   email?: string,
//   uuid?: string,
// ): Promise<boolean> {
//   const resolved = await resolveUserDocRef(email, uuid);
//   if (!resolved) return false;

//   await updateDoc(resolved.ref, {
//     isSubscribed: false,
//     subscriptionType: "free",
//     planType: "Free",
//     subscriptionEndDate: null,
//     isTrialActive: false,
//     payment_amount: null,
//     payment_date: null,
//     updatedAt: new Date().toISOString(),
//   });

//   return true;
// }
