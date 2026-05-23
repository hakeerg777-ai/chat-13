"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  serverTimestamp,
  increment,
  writeBatch,
  limit,
  arrayUnion,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Room, UserProfile } from "@/lib/types"

const COLORS = [
  "#a855f7", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
]

export function useRooms(currentUser: UserProfile | null) {
  const [myRooms, setMyRooms] = useState<Room[]>([])
  const [publicRooms, setPublicRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  // Listen to user's joined public rooms + DM rooms
  useEffect(() => {
    if (!currentUser) {
      setMyRooms([])
      setLoading(false)
      return
    }

    let publicLoaded = false
    let dmLoaded = false
    let publicRoomsData: Room[] = []
    let dmRoomsData: Room[] = []

    const mergeAndSet = () => {
      if (!publicLoaded || !dmLoaded) return
      // Merge and sort by lastMessageAt desc (null values go last)
      const all = [...publicRoomsData, ...dmRoomsData].sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
        return bTime - aTime
      })
      setMyRooms(all)
      setLoading(false)
    }

    // Listener 1: public rooms the user is a member of
    const publicQ = query(
      collection(db, "rooms"),
      where("members", "array-contains", currentUser.uid),
      where("isPublic", "==", true),
      orderBy("lastMessageAt", "desc"),
      limit(20)
    )

    const unsubPublic = onSnapshot(publicQ, (snap) => {
      publicRoomsData = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Room))
      publicLoaded = true
      mergeAndSet()
    })

    // Listener 2: DM rooms (isPublic: false)
    const dmQ = query(
      collection(db, "rooms"),
      where("members", "array-contains", currentUser.uid),
      where("isPublic", "==", false),
      orderBy("lastMessageAt", "desc"),
      limit(10)
    )

    const unsubDM = onSnapshot(dmQ, (snap) => {
      dmRoomsData = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Room))
      dmLoaded = true
      mergeAndSet()
    })

    return () => {
      unsubPublic()
      unsubDM()
    }
  }, [currentUser?.uid])

  // Load public rooms (one-time, not realtime — saves reads)
  const loadPublicRooms = useCallback(async () => {
    if (!currentUser) return

    const q = query(
      collection(db, "rooms"),
      where("isPublic", "==", true),
      where("members", "not-in", [currentUser.uid]), // Fix: array not nested array
      orderBy("memberCount", "desc"),
      limit(15)
    )

    const snap = await getDocs(q)
    setPublicRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Room)))
  }, [currentUser?.uid])

  const createRoom = useCallback(async (
    name: string,
    description: string,
    icon: string
  ): Promise<Room | null> => {
    if (!currentUser) return null

    const batch = writeBatch(db)
    const roomRef = doc(collection(db, "rooms"))

    const newRoom: Omit<Room, "id"> = {
      name: name.trim(),
      description: description.trim(),
      icon,
      ownerId: currentUser.uid,
      ownerName: currentUser.username,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      isPublic: true,
      memberCount: 1,
      members: [currentUser.uid],
      lastMessage: "تم إنشاء الغرفة 🎉",
      lastMessageAt: null,
      createdAt: serverTimestamp() as any,
    }

    batch.set(roomRef, newRoom)

    // Increment user XP
    const userRef = doc(db, "users", currentUser.uid)
    batch.update(userRef, { xp: increment(30) })

    await batch.commit()
    return { id: roomRef.id, ...newRoom } as Room
  }, [currentUser])

  const joinRoom = useCallback(async (roomId: string): Promise<boolean> => {
    if (!currentUser) return false

    // arrayUnion is atomic — no race condition when multiple users join simultaneously
    const roomRef = doc(db, "rooms", roomId)
    await updateDoc(roomRef, {
      members: arrayUnion(currentUser.uid),
      memberCount: increment(1),
    })

    return true
  }, [currentUser])

  return { myRooms, publicRooms, loading, createRoom, joinRoom, loadPublicRooms }
}
