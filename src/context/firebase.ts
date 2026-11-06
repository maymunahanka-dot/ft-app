import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  // @ts-expect-error - the function exists but is not typed in the Firebase SDK
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBcl7hy63ZNw3mXiJTrL7EoWqdy44eWzHk",
  authDomain: "fashiontallycloud.firebaseapp.com",
  projectId: "fashiontallycloud",
  storageBucket: "fashiontallycloud.firebasestorage.app",
  messagingSenderId: "203645598940",
  appId: "1:203645598940:web:1c52d0a8f9a27c1c704819",
  measurementId: "G-W9HLR3B4CM",
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
// const auth = getAuth(app);
const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
const db = getFirestore(app);

export { auth, db };
