// ==================== BADGE RARITY ====================
export type BadgeRarity = "common" | "rare" | "epic" | "legendary" | "mythic"

export const RARITY_CONFIG: Record<BadgeRarity, {
  label: string
  labelAr: string
  bgGradient: string
  borderColor: string
  glowColor: string
  textColor: string
  particleColor: string
}> = {
  common: {
    label: "Common",
    labelAr: "عادي",
    bgGradient: "from-slate-600/80 via-slate-500/60 to-slate-600/80",
    borderColor: "border-slate-400/50",
    glowColor: "shadow-slate-400/30",
    textColor: "text-slate-300",
    particleColor: "#94a3b8",
  },
  rare: {
    label: "Rare",
    labelAr: "نادر",
    bgGradient: "from-blue-600/80 via-blue-500/60 to-cyan-500/80",
    borderColor: "border-blue-400/50",
    glowColor: "shadow-blue-500/40",
    textColor: "text-blue-300",
    particleColor: "#3b82f6",
  },
  epic: {
    label: "Epic",
    labelAr: "ملحمي",
    bgGradient: "from-purple-600/80 via-fuchsia-500/60 to-pink-500/80",
    borderColor: "border-purple-400/50",
    glowColor: "shadow-purple-500/50",
    textColor: "text-purple-300",
    particleColor: "#a855f7",
  },
  legendary: {
    label: "Legendary",
    labelAr: "أسطوري",
    bgGradient: "from-amber-500/80 via-yellow-400/60 to-orange-500/80",
    borderColor: "border-amber-400/60",
    glowColor: "shadow-amber-500/60",
    textColor: "text-amber-300",
    particleColor: "#f59e0b",
  },
  mythic: {
    label: "Mythic",
    labelAr: "خرافي",
    bgGradient: "from-rose-600/80 via-red-500/60 to-pink-600/80",
    borderColor: "border-rose-400/70",
    glowColor: "shadow-rose-500/70",
    textColor: "text-rose-300",
    particleColor: "#f43f5e",
  },
}

// ==================== BADGE UNLOCK CONDITIONS ====================
export type BadgeConditionType =
  | "messages"
  | "friends"
  | "days"
  | "rooms"
  | "level"
  | "xp"
  | "special"

export interface BadgeCondition {
  type: BadgeConditionType
  value: number
}

// ==================== BADGE DEFINITION ====================
export interface Badge {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  rarity: BadgeRarity
  icon: string // SVG icon name
  condition: BadgeCondition
  isAnimated?: boolean
  hasParticles?: boolean
}

// ==================== ALL BADGES ====================
export const ALL_BADGES: Badge[] = [
  // === COMMON BADGES ===
  {
    id: "newcomer",
    name: "Newcomer",
    nameAr: "وافد جديد",
    description: "Join the community",
    descriptionAr: "انضم للمجتمع",
    rarity: "common",
    icon: "seedling",
    condition: { type: "special", value: 1 },
  },
  {
    id: "first_message",
    name: "First Words",
    nameAr: "الكلمات الأولى",
    description: "Send your first message",
    descriptionAr: "أرسل أول رسالة",
    rarity: "common",
    icon: "message",
    condition: { type: "messages", value: 1 },
  },
  {
    id: "friendly",
    name: "Friendly",
    nameAr: "ودود",
    description: "Add your first friend",
    descriptionAr: "أضف أول صديق",
    rarity: "common",
    icon: "handshake",
    condition: { type: "friends", value: 1 },
  },
  
  // === RARE BADGES ===
  {
    id: "chatterbox",
    name: "Chatterbox",
    nameAr: "ثرثار",
    description: "Send 50 messages",
    descriptionAr: "أرسل 50 رسالة",
    rarity: "rare",
    icon: "messages",
    condition: { type: "messages", value: 50 },
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    nameAr: "فراشة اجتماعية",
    description: "Have 5 friends",
    descriptionAr: "لديك 5 أصدقاء",
    rarity: "rare",
    icon: "users",
    condition: { type: "friends", value: 5 },
  },
  {
    id: "room_creator",
    name: "Room Master",
    nameAr: "صانع الغرف",
    description: "Create your first room",
    descriptionAr: "أنشئ أول غرفة",
    rarity: "rare",
    icon: "door",
    condition: { type: "rooms", value: 1 },
    isAnimated: true,
  },
  {
    id: "week_streak",
    name: "Weekly Warrior",
    nameAr: "محارب أسبوعي",
    description: "Login for 7 days",
    descriptionAr: "سجل دخول 7 أيام",
    rarity: "rare",
    icon: "calendar",
    condition: { type: "days", value: 7 },
  },
  {
    id: "rising_star",
    name: "Rising Star",
    nameAr: "نجم صاعد",
    description: "Reach level 3",
    descriptionAr: "وصول المستوى 3",
    rarity: "rare",
    icon: "star",
    condition: { type: "level", value: 3 },
    isAnimated: true,
  },

  // === EPIC BADGES ===
  {
    id: "communicator",
    name: "Communicator",
    nameAr: "محاور",
    description: "Send 200 messages",
    descriptionAr: "أرسل 200 رسالة",
    rarity: "epic",
    icon: "radio",
    condition: { type: "messages", value: 200 },
    isAnimated: true,
  },
  {
    id: "popular",
    name: "Popular",
    nameAr: "محبوب",
    description: "Have 15 friends",
    descriptionAr: "لديك 15 صديق",
    rarity: "epic",
    icon: "heart",
    condition: { type: "friends", value: 15 },
    isAnimated: true,
  },
  {
    id: "veteran",
    name: "Veteran",
    nameAr: "مخضرم",
    description: "Login for 30 days",
    descriptionAr: "سجل دخول 30 يوم",
    rarity: "epic",
    icon: "shield",
    condition: { type: "days", value: 30 },
    isAnimated: true,
  },
  {
    id: "elite",
    name: "Elite",
    nameAr: "نخبة",
    description: "Reach level 5",
    descriptionAr: "وصول المستوى 5",
    rarity: "epic",
    icon: "zap",
    condition: { type: "level", value: 5 },
    isAnimated: true,
  },
  {
    id: "verified",
    name: "Verified",
    nameAr: "موثق",
    description: "Reach 1000 XP",
    descriptionAr: "اجمع 1000 XP",
    rarity: "epic",
    icon: "check-circle",
    condition: { type: "xp", value: 1000 },
    isAnimated: true,
  },

  // === LEGENDARY BADGES ===
  {
    id: "top_chat",
    name: "Top Chat",
    nameAr: "نجم الدردشة",
    description: "Send 500 messages",
    descriptionAr: "أرسل 500 رسالة",
    rarity: "legendary",
    icon: "trophy",
    condition: { type: "messages", value: 500 },
    isAnimated: true,
    hasParticles: true,
  },
  {
    id: "influencer",
    name: "Influencer",
    nameAr: "مؤثر",
    description: "Have 30 friends",
    descriptionAr: "لديك 30 صديق",
    rarity: "legendary",
    icon: "flame",
    condition: { type: "friends", value: 30 },
    isAnimated: true,
    hasParticles: true,
  },
  {
    id: "diamond",
    name: "Diamond",
    nameAr: "ماسي",
    description: "Reach level 6",
    descriptionAr: "وصول المستوى 6",
    rarity: "legendary",
    icon: "gem",
    condition: { type: "level", value: 6 },
    isAnimated: true,
    hasParticles: true,
  },
  {
    id: "dedicated",
    name: "Dedicated",
    nameAr: "مخلص",
    description: "Login for 60 days",
    descriptionAr: "سجل دخول 60 يوم",
    rarity: "legendary",
    icon: "award",
    condition: { type: "days", value: 60 },
    isAnimated: true,
    hasParticles: true,
  },
  {
    id: "vip",
    name: "VIP",
    nameAr: "شخصية مهمة",
    description: "Reach 5000 XP",
    descriptionAr: "اجمع 5000 XP",
    rarity: "legendary",
    icon: "crown",
    condition: { type: "xp", value: 5000 },
    isAnimated: true,
    hasParticles: true,
  },

  // === MYTHIC BADGES ===
  {
    id: "legend",
    name: "Legend",
    nameAr: "أسطورة",
    description: "Send 1000 messages",
    descriptionAr: "أرسل 1000 رسالة",
    rarity: "mythic",
    icon: "sparkles",
    condition: { type: "messages", value: 1000 },
    isAnimated: true,
    hasParticles: true,
  },
  {
    id: "king",
    name: "King",
    nameAr: "ملك",
    description: "Reach level 8",
    descriptionAr: "وصول المستوى 8",
    rarity: "mythic",
    icon: "king",
    condition: { type: "level", value: 8 },
    isAnimated: true,
    hasParticles: true,
  },
  {
    id: "founder",
    name: "Founder",
    nameAr: "مؤسس",
    description: "Early community member",
    descriptionAr: "عضو مؤسس في المجتمع",
    rarity: "mythic",
    icon: "rocket",
    condition: { type: "special", value: 0 },
    isAnimated: true,
    hasParticles: true,
  },
  {
    id: "event_winner",
    name: "Event Winner",
    nameAr: "بطل الحدث",
    description: "Win a special event",
    descriptionAr: "فز في حدث خاص",
    rarity: "mythic",
    icon: "medal",
    condition: { type: "special", value: 0 },
    isAnimated: true,
    hasParticles: true,
  },
]

// Get badge by ID
export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find((b) => b.id === id)
}

// Get badges by rarity
export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return ALL_BADGES.filter((b) => b.rarity === rarity)
}
