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
      const userDocRef = doc(db, "fashiontally_users", user.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as RegisterUserData;
          console.log("hit fetch user", fetchedData);
          setUserData(fetchedData);
        } else {
          console.log("No user profile found in Firestore for UID:", user.uid);
        }
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [setUserData]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userdata = await signInWithEmailAndPassword(auth, email, password);
      return userdata;
    } catch (error) {
      console.error("Error signing in:", error);
      //   throw error;
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userDataInput: RegisterUserData, password: string) => {
    setLoading(true);
    try {
      const userEmail = userDataInput.email.trim();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userEmail,
        password,
      );
      const newUser = userCredential.user;

      if (newUser) {
        const userDocRef = doc(db, "fashiontally_users", newUser.uid);
        await setDoc(userDocRef, userDataInput);
      } else {
        console.log("user registration failed");
        // throw new Error('User registration failed, user not created.');
      }
    } catch (error) {
      console.error("Error signing up:", error);
      //   throw error;
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
    } catch (error) {
      console.error("Error signing out:", error);
      //   throw error;
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
    } catch (error) {
      console.error("Error sending reset email:", error);
      //   throw error;
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
      } catch (error) {
        console.error("Error refreshing user data:", error);
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
