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
  doc, setDoc, getDoc, updateDoc, onSnapshot,
  serverTimestamp, collection, query, where, limit, getDocs,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/types"

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)
  const [debugState, setDebugState] = useState<string>("initializing...")
  const [error, setError] = useState<string | null>(null)
  const profileUnsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    setDebugState("waiting for onAuthStateChanged...")

    const timeoutId = setTimeout(() => {
      if (authLoading) {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        const msg = `Timeout 10s — projectId=${projectId ?? "MISSING"} apiKey=${apiKey ? "ok" : "MISSING"} authDomain=${authDomain ?? "MISSING"}`
        console.error(msg)
        setDebugState(msg)
        setFirebaseError(`Firebase لم يستجب خلال 10 ثوانٍ.\n${msg}`)
        setAuthLoading(false)
      }
    }, 10000)

    let authUnsub: (() => void) | null = null

    try {
      authUnsub = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          clearTimeout(timeoutId)
          setUser(firebaseUser)

          if (profileUnsubRef.current) {
            profileUnsubRef.current()
            profileUnsubRef.current = null
          }

          if (firebaseUser) {
            setDebugState(`auth ok — uid=${firebaseUser.uid} — loading profile...`)
            setProfileLoading(true)
            const profileRef = doc(db, "users", firebaseUser.uid)
            const profileUnsub = onSnapshot(
              profileRef,
              (snap) => {
                if (snap.exists()) {
                  setProfile(snap.data() as UserProfile)
                  setDebugState(`profile loaded ✅`)
                } else {
                  setProfile(null)
                  setDebugState(`profile NOT found in Firestore — uid=${firebaseUser.uid}`)
                }
                setProfileLoading(false)
                setAuthLoading(false)
              },
              (err) => {
                const msg = `Firestore error: ${err.code} — ${err.message}`
                console.error(msg)
                setDebugState(msg)
                setFirebaseError(msg)
                setProfileLoading(false)
                setAuthLoading(false)
              }
            )
            profileUnsubRef.current = profileUnsub
          } else {
            setDebugState("no user — showing auth screen")
            setProfile(null)
            setProfileLoading(false)
            setAuthLoading(false)
          }
        },
        (err) => {
          clearTimeout(timeoutId)
          const msg = `Auth listener error: ${err.code} — ${err.message}`
          console.error(msg)
          setDebugState(msg)
          setFirebaseError(msg)
          setAuthLoading(false)
        }
      )
    } catch (err: any) {
      clearTimeout(timeoutId)
      const msg = `Firebase init failed: ${err.message}`
      console.error(msg)
      setDebugState(msg)
      setFirebaseError(msg)
      setAuthLoading(false)
    }

    return () => {
      clearTimeout(timeoutId)
      if (authUnsub) authUnsub()
      if (profileUnsubRef.current) profileUnsubRef.current()
    }
  }, [])

  const loading = authLoading || profileLoading

  const isUsernameTaken = async (username: string): Promise<boolean> => {
    const q = query(collection(db, "users"), where("username", "==", username), limit(1))
    const snap = await getDocs(q)
    return !snap.empty
  }

  const register = async (
    username: string, email: string, password: string, avatar: string, color: string
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const taken = await isUsernameTaken(username.trim())
      if (taken) return { success: false, error: "اسم المستخدم مستخدم مسبقاً، اختر اسماً آخر" }

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(firebaseUser, { displayName: username.trim() })

      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        username: username.trim(),
        email, avatar, color,
        bio: "", level: 1, xp: 50, messagesSent: 0,
        friends: [], badges: [],
        joinDate: new Date().toISOString(),
        dailyLogin: new Date().toDateString(),
        createdAt: serverTimestamp() as any,
      }
      await setDoc(doc(db, "users", firebaseUser.uid), userProfile)
      return { success: true }
    } catch (err: any) {
      const msg = getAuthError(err.code)
      setError(msg)
      return { success: false, error: msg }
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null)
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      const profileRef = doc(db, "users", firebaseUser.uid)
      const snap = await getDoc(profileRef)
      if (snap.exists()) {
        const data = snap.data() as UserProfile
        const today = new Date().toDateString()
        if (data.dailyLogin !== today) {
          await updateDoc(profileRef, { dailyLogin: today, xp: (data.xp || 0) + 50 })
        }
      }
      return { success: true }
    } catch (err: any) {
      const msg = getAuthError(err.code)
      setError(msg)
      return { success: false, error: msg }
    }
  }

  const logout = async () => { await signOut(auth) }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    await updateDoc(doc(db, "users", user.uid), updates)
  }

  return { user, profile, loading, error, firebaseError, debugState, register, login, logout, updateUserProfile }
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
