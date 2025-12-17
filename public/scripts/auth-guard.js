// /public/scripts/auth-guard.js
// Load config first
if (!window.CONFIG) {
  const script = document.createElement('script');
  script.src = 'config.js';
  document.head.appendChild(script);
}

import { auth } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// If this module is included on a page, it will redirect to login.html when not authenticated.
onAuthStateChanged(auth, (user) => {
  const adminEmail = window.CONFIG?.ADMIN_EMAIL || "prady346@gmail.com";
  if (!user || user.email !== adminEmail) {
    // not logged in or wrong account -> go to login
    // allow a short delay to avoid flash:
    setTimeout(() => { window.location.href = "login.html"; }, 200);
  }
});

// export logout helper for dashboard pages
export function logout() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch(err => {
    console.error("Sign-out error:", err);
    console.error("Logout error:", err.message);
    // Show user-friendly error instead of alert
  });
}
