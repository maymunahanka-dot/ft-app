import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { auth, db } from "../context/firebase";
import { useUserStore } from "../stores/userSlice";
import { RegisterUserData } from "../types/auth";
import { ShowToastMessage } from "../utils/random";
import { uploadImageToCloudinary } from "../utils/uploadImageToCloudinary";

export function useAuth() {
  //   const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setUserData = useUserStore.getState().updateUser;

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
      const userDocRef = doc(db, "fashiontally_users", uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        console.warn("[FETCH_USER_PROFILE] User profile not found", { uid });
        ShowToastMessage({
          title: "User does not exists",
          preset: "error",
          haptic: "error",
        });
        return null;
      }

      return docSnap.data() as RegisterUserData;
    } catch (error: any) {
      console.error("[FETCH_USER_PROFILE] Failed to fetch user profile", {
        uid,
        error,
      });
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(cred.user.uid);

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
