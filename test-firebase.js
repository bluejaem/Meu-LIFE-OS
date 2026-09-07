import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const env = {
  VITE_FIREBASE_API_KEY: "AIzaSyDFsnqRaQOkkfDBpFg1BTJZlPf6tTSStTA",
  VITE_FIREBASE_AUTH_DOMAIN: "meu-life-os-689a7.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "meu-life-os-689a7",
  VITE_FIREBASE_STORAGE_BUCKET: "meu-life-os-689a7.firebasestorage.app",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "261591922324",
  VITE_FIREBASE_APP_ID: "1:261591922324:web:edde049a088d296c34e681"
};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  try {
    await createUserWithEmailAndPassword(auth, "testuser2@meulifeos.app", "password123");
    console.log("Success");
  } catch(e) {
    console.error("FIREBASE ERROR:", e);
  }
}
test();
