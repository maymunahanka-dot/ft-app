import { auth } from "../context/firebase";

/**
 * Get the current authenticated user's ID
 * @returns The user's UID or throws an error if not authenticated
 */
export const getCurrentUserId = (): string => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error(
      "User not authenticated. Please log in to access this data."
    );
  }
  return user.uid;
};

/**
 * Get the current authenticated user's email
 * @returns The user's email or a default if not available
 */
export const getCurrentUserEmail = (): string => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error(
      "User not authenticated. Please log in to access this data."
    );
  }
  return user.email || "user@fashiontally.com";
};

/**
 * Get the current authenticated user's data
 * @returns Object with uid and email
 */
export const getCurrentUser = (): { uid: string; email: string } => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error(
      "User not authenticated. Please log in to access this data."
    );
  }
  return {
    uid: user.uid,
    email: user.email || "user@fashiontally.com",
  };
};

/**
 * Check if a user is currently authenticated
 * @returns boolean indicating if user is authenticated
 */
export const isUserAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};
