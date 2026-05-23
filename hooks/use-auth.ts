"use client"

import { useState, useEffect, useRef } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/types"

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Keep a ref to the profile unsubscribe so we can clean it up
  const profileUnsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)

      // Tear down previous profile listener if user changed
      if (profileUnsubRef.current) {
        profileUnsubRef.current()
        profileUnsubRef.current = null
      }

      if (firebaseUser) {
        // Real-time profile listener — profile stays in sync across devices
        const profileRef = doc(db, "users", firebaseUser.uid)
        const profileUnsub = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile)
          } else {
            setProfile(null)
          }
          setLoading(false)
        }, (err) => {
          console.error("Profile listener error:", err)
          setLoading(false)
        })
        profileUnsubRef.current = profileUnsub
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      authUnsub()
      if (profileUnsubRef.current) profileUnsubRef.current()
    }
  }, [])

  /**
   * Check username uniqueness before creating account.
   * Uses a Firestore query — requires the composite index on username field.
   */
  const isUsernameTaken = async (username: string): Promise<boolean> => {
    const q = query(
      collection(db, "users"),
      where("username", "==", username),
      limit(1)
    )
    const snap = await getDocs(q)
    return !snap.empty
  }

  const register = async (
    username: string,
    email: string,
    password: string,
    avatar: string,
    color: string
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      // 1. Check username uniqueness before creating the Auth account
      const taken = await isUsernameTaken(username.trim())
      if (taken) {
        return { success: false, error: "اسم المستخدم مستخدم مسبقاً، اختر اسماً آخر" }
      }

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(firebaseUser, { displayName: username.trim() })

      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        username: username.trim(),
        email,
        avatar,
        color,
        bio: "",
        level: 1,
        xp: 50,
        messagesSent: 0,
        friends: [],
        badges: [],
        joinDate: new Date().toISOString(),
        dailyLogin: new Date().toDateString(),
        createdAt: serverTimestamp() as any,
      }

      await setDoc(doc(db, "users", firebaseUser.uid), userProfile)
      // onSnapshot listener will pick up the new profile automatically
      return { success: true }
    } catch (err: any) {
      const msg = getAuthError(err.code)
      setError(msg)
      return { success: false, error: msg }
    }
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)

      // Update daily login XP — one getDoc read, cheap
      const profileRef = doc(db, "users", firebaseUser.uid)
      const snap = await getDoc(profileRef)
      if (snap.exists()) {
        const data = snap.data() as UserProfile
        const today = new Date().toDateString()
        if (data.dailyLogin !== today) {
          // Daily XP update — bounded +50 XP, won't conflict with the Firestore rule
          await updateDoc(profileRef, {
            dailyLogin: today,
            xp: (data.xp || 0) + 50,
          })
          // onSnapshot will propagate the update automatically
        }
      }
      return { success: true }
    } catch (err: any) {
      const msg = getAuthError(err.code)
      setError(msg)
      return { success: false, error: msg }
    }
  }

  const logout = async () => {
    await signOut(auth)
    // onAuthStateChanged will tear down the profile listener and set profile to null
  }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    const ref = doc(db, "users", user.uid)
    await updateDoc(ref, updates)
    // onSnapshot will merge the update into local profile state automatically
  }

  return { user, profile, loading, error, register, login, logout, updateUserProfile }
}

function getAuthError(code: string): string {
  switch (code) {
    case "auth/email-already-in-use": return "البريد الإلكتروني مستخدم مسبقاً"
    case "auth/invalid-email": return "البريد الإلكتروني غير صالح"
    case "auth/weak-password": return "كلمة المرور ضعيفة (6 أحرف على الأقل)"
    case "auth/user-not-found": return "لا يوجد حساب بهذا البريد"
    case "auth/wrong-password": return "كلمة المرور غير صحيحة"
    case "auth/invalid-credential": return "البريد أو كلمة المرور غير صحيحة"
    case "auth/too-many-requests": return "محاولات كثيرة، حاول لاحقاً"
    default: return "حدث خطأ، حاول مجدداً"
  }
}
