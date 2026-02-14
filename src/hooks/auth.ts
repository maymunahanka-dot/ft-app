import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { auth, db } from "../context/firebase";
import { getCurrentUserEmail } from "../lib/auth-utils";
import { useUserStore } from "../stores/userSlice";
import { RegisterUserData } from "../types/auth";
import { FormatFirebaseError, ShowToastMessage } from "../utils/random";
import { uploadImageToCloudinary } from "../utils/uploadImageToCloudinary";

export function useAuth() {
  //   const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setUserData = useUserStore.getState().updateUser;

  const fetchBrandSettings = useUserStore.getState().fetchBrandSettings;
  const editBrandSettings = useUserStore.getState().editBrandSettings;

  const [firebaseUser, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchUserProfile(user.uid);
        setUserData(profile);
        if (profile) await fetchBrandSettings();
      } catch (error) {
        console.error("Error fetching user data:", error);
        // ShowToastMessage({
        //   title: FormatFirebaseError(error),
        //   preset: "error",
        //   haptic: "error",
        // });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserProfile = async (
    uid: string,
  ): Promise<RegisterUserData | null> => {
    try {
      if (uid) {
        const ref = doc(db, "fashiontally_users", uid);
        const docSnap = await getDoc(ref);

        if (docSnap.exists()) {
          return docSnap.data() as RegisterUserData;
        }
      }

      const email = getCurrentUserEmail();
      if (email) {
        const q = query(
          collection(db, "fashiontally_users"),
          where("email", "==", email),
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          return snap.docs[0].data() as RegisterUserData;
        }
      }

      console.warn("[FETCH_USER_PROFILE] No profile found", { uid, email });
      ShowToastMessage({
        title: "User does not exist",
        preset: "error",
        haptic: "error",
      });
      return null;
    } catch (error: any) {
      console.error("[FETCH_USER_PROFILE] Failed to fetch user profile", {
        uid,
        error,
      });
      ShowToastMessage({
        title: "Error fetching user",
        message: FormatFirebaseError(error),
        preset: "error",
        haptic: "error",
      });
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(cred.user.uid);

      await fetchBrandSettings();

      setUser(cred.user);
      setUserData(profile);

      return cred;
    } catch (error: any) {
      console.error("Error signing in:", error);
      ShowToastMessage({
        title: "Error signing in",
        preset: "error",
        haptic: "error",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userDataInput: RegisterUserData, password: string) => {
    setLoading(true);
    try {
      const data = userDataInput;
      const userEmail = userDataInput.email.trim();

      if (userDataInput.logo) {
        const imageUrl = await uploadImageToCloudinary(userDataInput.logo);
        console.log("image url", imageUrl);
        if (!imageUrl) return;
        data.logo = imageUrl;
      }

      if (userDataInput.businessName) {
        await editBrandSettings({
          id: "",
          logoUrl: data.logo,
          businessName: userDataInput.businessName,
          businessAddress: "",
          businessEmail: userDataInput.email,
          businessWebsite: "",
          businessPhone: userDataInput.phone,
          footerText: "",
          termsAndConditions: "",
          updatedAt: "",
          userEmail: getCurrentUserEmail(),
        });
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userEmail,
        password,
      );
      const newUser = userCredential.user;

      if (newUser) {
        const userDocRef = doc(db, "fashiontally_users", newUser.uid);
        await setDoc(userDocRef, data);
      } else {
        console.log("user registration failed");
        // throw new Error('User registration failed, user not created.');
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      ShowToastMessage({
        title: "Error signing up",
        preset: "error",
        haptic: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      console.log("user details", auth.name);
      setUserData(null);
      // router.replace("/(auth)/sign-in");
    } catch (error: any) {
      console.error("Error signing out:", error);
      ShowToastMessage({
        title: "Error signing out",
        preset: "error",
        haptic: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendResetEmail = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Email Sent",
        "Password reset email has been sent. Please check your inbox and spam folder.",
        [{ text: "OK" }],
      );
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      ShowToastMessage({
        title: "Error sending reset email",
        preset: "error",
        haptic: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const confrimResetCode = async (otp: string, newPassword: string) => {
    setLoading(true);
    try {
      await confirmPasswordReset(auth, otp, newPassword);
    } catch (error) {
      console.error("Error sending reset password:", error);
      //   throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (firebaseUser && firebaseUser.uid) {
      const userDocRef = doc(db, "fashiontally_users", firebaseUser.uid);
      setLoading(true);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as RegisterUserData;
          setUserData(fetchedData);
          await fetchBrandSettings();
        }
      } catch (error: any) {
        console.error("Error refreshing user data:", error);
        // ShowToastMessage({
        //   title: "",
        //   preset: "error",
        //   haptic: "error",
        // });
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    loading,
    refreshUser,
    signIn,
    signOut,
    signUp,
    sendResetEmail,
    confrimResetCode,
  };
}
