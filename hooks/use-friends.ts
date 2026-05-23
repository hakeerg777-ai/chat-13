"use client"

import { useState, useCallback } from "react"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  increment,
  writeBatch,
  limit,
  orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserProfile } from "@/lib/types"

export function useFriends(currentUser: UserProfile | null, updateProfile: (u: Partial<UserProfile>) => Promise<void>) {
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [searching, setSearching] = useState(false)

  const searchUsers = useCallback(async (term: string) => {
    if (!currentUser || term.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      // Firestore prefix search: username >= term AND username < term + '\uf8ff'
      const q = query(
        collection(db, "users"),
        where("username", ">=", term),
        where("username", "<=", term + "\uf8ff"),
        limit(10)
      )
      const snap = await getDocs(q)
      const results = snap.docs
        .map((d) => d.data() as UserProfile)
        .filter((u) => u.uid !== currentUser.uid)

      setSearchResults(results)
    } finally {
      setSearching(false)
    }
  }, [currentUser])

  const addFriend = useCallback(async (friendUid: string): Promise<void> => {
    if (!currentUser) return

    const batch = writeBatch(db)
    const userRef = doc(db, "users", currentUser.uid)

    batch.update(userRef, {
      friends: arrayUnion(friendUid),
      xp: increment(30),
    })

    // onSnapshot in useAuth updates state automatically — no updateProfile needed
    await batch.commit()
  }, [currentUser])

  const removeFriend = useCallback(async (friendUid: string): Promise<void> => {
    if (!currentUser) return

    const userRef = doc(db, "users", currentUser.uid)
    // onSnapshot in useAuth updates state automatically — no updateProfile needed
    await updateDoc(userRef, { friends: arrayRemove(friendUid) })
  }, [currentUser])

  const getFriendProfiles = useCallback(async (): Promise<UserProfile[]> => {
    if (!currentUser || currentUser.friends.length === 0) return []

    // Firestore "in" query supports up to 30 items
    // Batch into chunks of 30 if needed
    const chunks: string[][] = []
    for (let i = 0; i < currentUser.friends.length; i += 30) {
      chunks.push(currentUser.friends.slice(i, i + 30))
    }

    const results: UserProfile[] = []
    for (const chunk of chunks) {
      const q = query(collection(db, "users"), where("uid", "in", chunk))
      const snap = await getDocs(q)
      snap.docs.forEach((d) => results.push(d.data() as UserProfile))
    }
    return results
  }, [currentUser])

  /**
   * Get or create a DM room between two users
   * DM rooms use a deterministic ID to avoid duplicates
   */
  const getOrCreateDM = useCallback(async (friendUid: string): Promise<string> => {
    if (!currentUser) return ""

    // Deterministic DM ID: sorted UIDs joined
    const sorted = [currentUser.uid, friendUid].sort()
    const dmId = `dm_${sorted[0]}_${sorted[1]}`

    const dmRef = doc(db, "rooms", dmId)
    const snap = await getDoc(dmRef)

    if (!snap.exists()) {
      const friendSnap = await getDoc(doc(db, "users", friendUid))
      const friend = friendSnap.data() as UserProfile

      const batch = writeBatch(db)
      batch.set(dmRef, {
        id: dmId,
        name: friend.username,
        description: "محادثة خاصة",
        icon: friend.avatar,
        ownerId: currentUser.uid,
        ownerName: currentUser.username,
        color: "#6366f1",
        isPublic: false,
        memberCount: 2,
        members: [currentUser.uid, friendUid],
        lastMessage: "",
        lastMessageAt: null,
        createdAt: new Date().toISOString(),
      })
      await batch.commit()
    }

    return dmId
  }, [currentUser])

  return { searchResults, searching, searchUsers, addFriend, removeFriend, getFriendProfiles, getOrCreateDM }
}
