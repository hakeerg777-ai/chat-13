import type { FieldValue, Timestamp } from "firebase/firestore"

// ==================== USER ====================
export interface UserProfile {
  uid: string
  username: string
  email: string
  avatar: string       // emoji character (fallback)
  photoURL?: string    // رابط صورة البروفايل الحقيقية (ImgBB) — اختياري
  color: string        // hex color
  bio: string
  level: number
  xp: number
  messagesSent: number
  friends: string[]    // array of uids
  badges: string[]
  joinDate: string
  dailyLogin: string
  createdAt: Timestamp | FieldValue | string
}

// ==================== ROOM ====================
export interface Room {
  id: string
  name: string
  description: string
  icon: string
  ownerId: string
  ownerName: string
  color: string
  isPublic: boolean
  memberCount: number
  members: string[]       // array of UIDs — required for Firestore queries & rules
  lastMessage?: string
  lastMessageAt?: Timestamp | null
  createdAt: Timestamp | FieldValue
}

// ==================== MESSAGE ====================
export interface Message {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatar: string
  senderPhotoURL?: string  // رابط صورة المُرسِل الحقيقية (اختياري)
  senderColor: string
  text: string
  createdAt: Timestamp | null
}

// ==================== PRESENCE ====================
export interface PresenceData {
  online: boolean
  lastSeen: number  // Unix timestamp
  username?: string
}

// ==================== PAGINATION ====================
export interface MessagePage {
  messages: Message[]
  hasMore: boolean
  oldestDoc: any  // Firestore DocumentSnapshot for pagination cursor
}
