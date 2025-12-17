// /public/scripts/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: window.CONFIG.FIREBASE_API_KEY,
  authDomain: window.CONFIG.FIREBASE_AUTH_DOMAIN,
  projectId: window.CONFIG.FIREBASE_PROJECT_ID,
  storageBucket: window.CONFIG.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.CONFIG.FIREBASE_MESSAGING_SENDER_ID,
  appId: window.CONFIG.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
