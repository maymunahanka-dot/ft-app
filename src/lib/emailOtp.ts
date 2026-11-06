import { API_BASE_URL } from "./apiClient";

/**
 * Email verification during sign-up. The backend emails the code and checks it;
 * the code never comes back to the app.
 */
async function postAuth<T>(path: string, payload: object): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data as T;
}

export const sendEmailOtp = (email: string) =>
  postAuth<{ success: true }>("send-email-otp", { email, flow: "server" });

/** Resolves with the token that sign-up sends as `emailVerificationToken`. */
export const verifyEmailOtp = async (email: string, otp: string) => {
  const data = await postAuth<{ verificationToken: string }>("verify-email-otp", { email, otp });
  return data.verificationToken;
};
