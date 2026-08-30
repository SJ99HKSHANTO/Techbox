// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWF8mcIZynDBbYOju0GhwsRCgaK-AGkBI",
  authDomain: "my-techbox.firebaseapp.com",
  projectId: "my-techbox",
  storageBucket: "my-techbox.firebasestorage.app",
  messagingSenderId: "793514793349",
  appId: "1:793514793349:web:298e6eb0c7ca1400da0cec",
  measurementId: "G-F5408BSZWK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);