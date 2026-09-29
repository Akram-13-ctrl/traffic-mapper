import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../src/firebase-applet-config.json";

// Check if config is a placeholder
export const isFirebasePlaceholder = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey === "placeholder-api-key";

let app, auth, db;

if (!isFirebasePlaceholder) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully.");
  } catch (err) {
    console.warn("⚠️ Firebase init failed, falling back to local simulation.", err);
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.log("ℹ️ Firebase is using placeholder. Running in local state simulation mode.");
}

export { app, auth, db };
