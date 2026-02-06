import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBkIRjKCVoqynviGVLPfvQHwRwoGUVTp6Q",
  authDomain: "stock-blind-box-game.firebaseapp.com",
  // Updated specific URL for Asia-Southeast1 👇
  databaseURL: "https://stock-blind-box-game-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stock-blind-box-game",
  storageBucket: "stock-blind-box-game.firebasestorage.app",
  messagingSenderId: "507809628592",
  appId: "1:507809628592:web:17fcfcf131ec93ee6d5675",
  measurementId: "G-F1B3C8DS06"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
