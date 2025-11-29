// /public/scripts/auth-guard.js
import { auth } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// If this module is included on a page, it will redirect to login.html when not authenticated.
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== "prady346@gmail.com") {
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
    alert("Logout error: " + err.message);
  });
}
