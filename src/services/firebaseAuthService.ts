import { auth } from "@/firebase";
import {
  signInWithEmailAndPassword as webSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as webCreateUserWithEmailAndPassword,
  sendPasswordResetEmail as webSendPasswordResetEmail,
} from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { isNativePlatform } from "@/services/revenueCatService";
import { authService } from "@/services/authService";
import { storageService } from "@/services/storageService";

export const getAuthToken = async (): Promise<string | null> => {
  try {
    if (isNativePlatform()) {
      const tokenResult = await FirebaseAuthentication.getIdToken();
      if (tokenResult?.token) return tokenResult.token;
    } else if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) return token;
    }
  } catch (e) {
    console.warn("Could not retrieve Firebase token directly:", e);
  }
  return (
    (await storageService.getItem("authToken")) ||
    localStorage.getItem("authToken")
  );
};

export const getAuthHeaders = async (
  contentType: string | null = "application/json"
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  const token = await getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const formatFirebaseAuthError = (error: any): string => {
  const code = error?.code || error?.message || "";
  if (typeof code === "string") {
    if (code.includes("auth/email-already-in-use")) {
      return "An account with this email address already exists. Please sign in instead.";
    }
    if (code.includes("auth/invalid-email")) {
      return "The email address entered is not valid.";
    }
    if (code.includes("auth/weak-password")) {
      return "The password is too weak. Password should be at least 6 characters long.";
    }
    if (
      code.includes("auth/user-not-found") ||
      code.includes("auth/wrong-password") ||
      code.includes("auth/invalid-credential")
    ) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (code.includes("auth/user-disabled")) {
      return "This account has been disabled. Please contact support.";
    }
    if (code.includes("auth/too-many-requests")) {
      return "Too many failed login attempts. Please wait a moment or reset your password.";
    }
  }
  return error?.message || "An unexpected authentication error occurred.";
};

export const firebaseAuthService = {
  /**
   * Authenticate user with Email & Password using Firebase Auth (Native or Web),
   * obtain the Firebase ID Token, and execute login with custom backend.
   */
  async loginWithEmailAndPassword(
    email: string,
    password: string,
    loginFirebase: (token: string) => Promise<any>
  ) {
    let token = "";
    try {
      if (isNativePlatform()) {
        await FirebaseAuthentication.signInWithEmailAndPassword({
          email,
          password,
        });
        const tokenResult = await FirebaseAuthentication.getIdToken();
        token = tokenResult.token || "";
      } else {
        const userCredential = await webSignInWithEmailAndPassword(
          auth,
          email,
          password
        );
        token = await userCredential.user.getIdToken();
      }

      if (!token) {
        throw new Error("Failed to retrieve authentication token.");
      }

      // Exchange Firebase token with backend & update session state
      const userData = await loginFirebase(token);
      return userData;
    } catch (error: any) {
      console.error("Firebase Email/Password Login error:", error);
      const friendlyMessage = formatFirebaseAuthError(error);
      const customError = new Error(friendlyMessage);
      (customError as any).code = error?.code || (error as any)?.code;
      (customError as any).userId = (error as any)?.userId;
      throw customError;
    }
  },

  /**
   * Register user with Email & Password using Firebase Auth (Native or Web),
   * obtain the Firebase ID Token, and execute signup with custom backend.
   */
  async signupWithEmailAndPassword(email: string, password: string) {
    let token = "";
    try {
      if (isNativePlatform()) {
        await FirebaseAuthentication.createUserWithEmailAndPassword({
          email,
          password,
        });
        const tokenResult = await FirebaseAuthentication.getIdToken();
        token = tokenResult.token || "";
      } else {
        const userCredential = await webCreateUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        token = await userCredential.user.getIdToken();
      }

      if (!token) {
        throw new Error("Failed to retrieve authentication token.");
      }

      // Register Firebase user on custom backend
      const responseData = await authService.signupFirebase(token, { email });
      return {
        token,
        responseData,
      };
    } catch (error: any) {
      console.error("Firebase Email/Password Signup error:", error);
      const friendlyMessage = formatFirebaseAuthError(error);
      const customError = new Error(friendlyMessage);
      (customError as any).code = error?.code || (error as any)?.code;
      throw customError;
    }
  },

  /**
   * Send password reset email via Firebase Auth (Native or Web).
   */
  async sendPasswordResetEmail(email: string) {
    try {
      if (isNativePlatform()) {
        await FirebaseAuthentication.sendPasswordResetEmail({ email });
      } else {
        await webSendPasswordResetEmail(auth, email);
      }
    } catch (error: any) {
      console.error("Firebase Password Reset error:", error);
      const friendlyMessage = formatFirebaseAuthError(error);
      throw new Error(friendlyMessage);
    }
  },
};
