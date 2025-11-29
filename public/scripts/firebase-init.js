// /public/scripts/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_63X6oKFv0TrJpKFLVBta9azbKcZs4Q0",
  authDomain: "kushwant-plays.firebaseapp.com",
  projectId: "kushwant-plays",
  storageBucket: "kushwant-plays.firebasestorage.app",
  messagingSenderId: "257275265481",
  appId: "1:257275265481:web:eebe942139dedde428a818"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
