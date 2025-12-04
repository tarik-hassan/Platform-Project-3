// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2YYpCzo-3vktbI2hSZppDpTR8tG_hPPY",
  authDomain: "project-3-d8d0c.firebaseapp.com",
  projectId: "project-3-d8d0c",
  storageBucket: "project-3-d8d0c.firebasestorage.app",
  messagingSenderId: "835700711588",
  appId: "1:835700711588:web:b30908818161c4f6020631",
  measurementId: "G-PNYH90D8SF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);