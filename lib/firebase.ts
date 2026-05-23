import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getDatabase } from "firebase/database"

// 🔧 استبدل هذه القيم بإعدادات مشروعك من Firebase Console
// Firebase > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

// Prevent duplicate initialization in Next.js dev mode (HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const rtdb = getDatabase(app)  // Realtime Database للـ Presence system

export default app
console.log("API KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
console.log("AUTH DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
