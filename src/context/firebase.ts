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

// import 'react-native-url-polyfill/auto';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
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

// For development, you can uncomment these lines to use emulators
// if (__DEV__ && !auth._delegate._config.emulator) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }
// if (__DEV__ && !db._delegate._databaseId.projectId.includes('demo-')) {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export { auth, db };
