// =====================================================================
// Firebase setup
// 1. Go to https://console.firebase.google.com and create a project.
// 2. Add a Web app (</> icon) and copy the config object it shows you.
// 3. Paste the values below.
// 4. Enable Authentication > Sign-in method > Email/Password (and Google).
// 5. Create a Firestore database, then paste firestore.rules into its Rules tab.
//
// Until you do this, the site runs in DEMO MODE: books come from
// books-seed.js, and accounts, cart and orders are stored in the
// browser only. Nothing breaks.
// =====================================================================

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Paystack PUBLIC test key (starts with pk_test_). Safe to put in the browser.
export const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxx";

// ---------------- Admin login ----------------
// The admin signs in with this ID (no email needed) on the first page.
// Firebase needs an email behind the scenes, so the ID maps to ADMIN_EMAIL.
// In Firebase: Authentication > Add user, using ADMIN_EMAIL and a strong password.
// Then in Firestore, set that user's document users/{uid} to { role: "admin" }.
export const ADMIN_ID = "blackbookworm-admin";
export const LEGACY_ADMIN_ID = "iwe-admin";
// Keep the Firebase auth email stable so an existing admin account still works.
export const ADMIN_EMAIL = "blackbookworm-admin@blackbookworm.admin";

// DEMO MODE ONLY (used when Firebase is not configured). Ignored once Firebase is connected.
export const DEMO_ADMIN_PASSWORD = "Admin@2026";

export const isFirebaseConfigured = !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_") && firebaseConfig.projectId && !firebaseConfig.projectId.startsWith("YOUR_");
