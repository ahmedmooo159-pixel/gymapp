// js/auth.js
// Firebase Authentication handling, Google Sign-In, and Auth Guards
import { auth, googleProvider } from "./firebase-config.js";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getUserProfile } from "./db.js";

/**
 * Initiates Google Sign-In popup
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

/**
 * Signs out the current user and redirects to login/landing
 */
export async function logOut() {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Sign-out error:", error);
    throw error;
  }
}

/**
 * Returns currently logged in user if available immediately
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Auth Guard for protected pages.
 * - If user is not authenticated -> redirects to index.html
 * - If user is authenticated but hasn't completed onboarding -> redirects to onboarding.html
 * - If user is authenticated & profile exists -> calls onSuccess({ user, profile })
 *
 * @param {Function} onSuccess - Callback receiving ({ user, profile })
 * @param {Object} [options]
 * @param {boolean} [options.allowIncompleteProfile=false] - For onboarding.html itself
 */
export function requireAuth(onSuccess, options = { allowIncompleteProfile: false }) {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Unauthenticated, save redirect intent if needed and bounce to landing
      window.location.href = "index.html";
      return;
    }

    try {
      const profile = await getUserProfile(user.uid);

      if (!profile && !options.allowIncompleteProfile) {
        // User has no profile, must onboard first
        window.location.href = "onboarding.html";
        return;
      }

      // If user has profile but is on onboarding page without edit mode, redirect to dashboard
      if (profile && options.allowIncompleteProfile && !window.location.search.includes('edit=true')) {
        window.location.href = "dashboard.html";
        return;
      }

      if (typeof onSuccess === 'function') {
        onSuccess({ user, profile });
      }
    } catch (err) {
      console.error("Error loading user profile during auth check:", err);
      if (typeof onSuccess === 'function') {
        onSuccess({ user, profile: null });
      }
    }
  });

  return unsubscribe;
}

/**
 * Redirect Guard for public pages (e.g. index.html).
 * If user is already logged in, automatically forward them.
 */
export function redirectIfAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          window.location.href = "dashboard.html";
        } else {
          window.location.href = "onboarding.html";
        }
      } catch (e) {
        window.location.href = "dashboard.html";
      }
    }
  });
}
