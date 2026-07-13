// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsC76KwYPsYenJQ_TPI-DAIP_Z-mnFMzM",
  authDomain: "cancer-analysis-3dfe5.firebaseapp.com",
  projectId: "cancer-analysis-3dfe5",
  storageBucket: "cancer-analysis-3dfe5.firebasestorage.app",
  messagingSenderId: "395818038765",
  appId: "1:395818038765:web:98983f19e137e58ac3e3e4",
  measurementId: "G-GVV4M2F69J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);