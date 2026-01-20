import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0nxbS27ma09C2PzWXQ957I7c3wpdIVqc",
  authDomain: "rent4hire-malloyagroup.firebaseapp.com",
  projectId: "rent4hire-malloyagroup",
  storageBucket: "rent4hire-malloyagroup.firebasestorage.app",
  messagingSenderId: "694002322256",
  appId: "1:694002322256:web:b4b4ad27f884408cd6ba55",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
