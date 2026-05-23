export const AVATARS = [
  "😎", "🦁", "🐯", "🦊", "🐼", "🦋", "🌟", "🎭",
  "🦄", "🐉", "🌈", "⚡", "🎯", "🔮", "🎸",
]

export const COLORS = [
  "#a855f7", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
]

export const ROOM_ICONS = [
  "🎮", "🎵", "🎨", "📚", "💪", "🍕",
  "🌍", "⚽", "🎬", "🎯", "🌸", "🔮",
]

export const LEVELS = [
  { level: 1, xp: 0,     title: "مبتدئ",  icon: "🌱" },
  { level: 2, xp: 100,   title: "ناشئ",    icon: "🌿" },
  { level: 3, xp: 250,   title: "متطور",   icon: "🍀" },
  { level: 4, xp: 500,   title: "متمرس",   icon: "⚡" },
  { level: 5, xp: 1000,  title: "خبير",    icon: "🔥" },
  { level: 6, xp: 2000,  title: "أسطورة",  icon: "💎" },
  { level: 7, xp: 4000,  title: "بطل",     icon: "🏆" },
  { level: 8, xp: 8000,  title: "ملك",     icon: "👑" },
]

export function getLevelInfo(xp: number) {
  let current = LEVELS[0]
  let next = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      current = LEVELS[i]
      next = LEVELS[i + 1] || LEVELS[i]
      break
    }
  }
  const progress =
    next.xp > current.xp
      ? Math.min(100, ((xp - current.xp) / (next.xp - current.xp)) * 100)
      : 100
  return { current, next, progress }
}

export function formatTime(ts: any): string {
  if (!ts) return ""
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function formatRelative(ts: any): string {
  if (!ts) return ""
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return "الآن"
  if (diff < 3600000) return `${Math.floor(diff / 60000)} د`
  if (diff < 86400000) return formatTime(ts)
  return d.toLocaleDateString("ar")
}
