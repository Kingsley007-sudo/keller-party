// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlhzl6N6IWDJwLgb2tx6Wx7oq1VkJJTrM",
  authDomain: "keller-party-ea233.firebaseapp.com",
  projectId: "project-8d4bbaea-c87d-40cd-ac0",
  storageBucket: "keller-party-ea233.firebasestorage.app",
  messagingSenderId: "179946853837",
  appId: "1:179946853837:web:12153b89e941357d136084",
  measurementId: "G-GQ9HLXT9MR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);