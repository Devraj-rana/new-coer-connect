import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFaHo6EtVCD2lTJEXCNSvBuhA_88-wxF0",
  authDomain: "coer-connect.firebaseapp.com",
  projectId: "coer-connect",
  storageBucket: "coer-connect.firebasestorage.app",
  messagingSenderId: "575832387908",
  appId: "1:575832387908:web:c21edf20d9f6b06f282711",
  measurementId: "G-L0305FQP5M"
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only on client side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
