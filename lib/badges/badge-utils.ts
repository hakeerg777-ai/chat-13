import type { Badge, BadgeCondition } from "./badge-types"
import { ALL_BADGES, RARITY_CONFIG } from "./badge-types"
import type { UserProfile } from "../types"

// Local alias so the rest of the file stays unchanged
type User = UserProfile

// ==================== BADGE UNLOCKING LOGIC ====================

interface UserStats {
  messagesSent: number
  friendsCount: number
  daysActive: number
  roomsCreated: number
  level: number
  xp: number
  hasSpecialBadges: string[]
}

/**
 * Calculate days since user joined
 */
function calculateDaysActive(joinDate: string): number {
  if (!joinDate) return 1
  try {
    // Handle Arabic date format
    const today = new Date()
    const join = new Date(joinDate)
    if (isNaN(join.getTime())) return 1
    const diffTime = Math.abs(today.getTime() - join.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays)
  } catch {
    return 1
  }
}

/**
 * Check if a badge condition is met
 */
function isConditionMet(condition: BadgeCondition, stats: UserStats): boolean {
  switch (condition.type) {
    case "messages":
      return stats.messagesSent >= condition.value
    case "friends":
      return stats.friendsCount >= condition.value
    case "days":
      return stats.daysActive >= condition.value
    case "rooms":
      return stats.roomsCreated >= condition.value
    case "level":
      return stats.level >= condition.value
    case "xp":
      return stats.xp >= condition.value
    case "special":
      return condition.value === 1 // Auto-unlock for newcomer
    default:
      return false
  }
}

/**
 * Get all unlocked badges for a user
 */
export function getUnlockedBadges(user: User, roomsCreated: number = 0): Badge[] {
  const stats: UserStats = {
    messagesSent: user.messagesSent,
    friendsCount: user.friends.length,
    daysActive: calculateDaysActive(user.joinDate),
    roomsCreated,
    level: user.level,
    xp: user.xp,
    hasSpecialBadges: user.badges || [],
  }

  const unlocked: Badge[] = []

  for (const badge of ALL_BADGES) {
    // Special badges are only unlocked if already in user.badges
    if (badge.condition.type === "special" && badge.condition.value === 0) {
      if (stats.hasSpecialBadges.includes(badge.id)) {
        unlocked.push(badge)
      }
      continue
    }

    if (isConditionMet(badge.condition, stats)) {
      unlocked.push(badge)
    }
  }

  return unlocked
}

/**
 * Get all locked badges with progress
 */
export function getLockedBadgesWithProgress(
  user: User,
  roomsCreated: number = 0
): Array<Badge & { progress: number; currentValue: number }> {
  const stats: UserStats = {
    messagesSent: user.messagesSent,
    friendsCount: user.friends.length,
    daysActive: calculateDaysActive(user.joinDate),
    roomsCreated,
    level: user.level,
    xp: user.xp,
    hasSpecialBadges: user.badges || [],
  }

  const unlockedIds = new Set(
    getUnlockedBadges(user, roomsCreated).map((b) => b.id)
  )

  return ALL_BADGES.filter((b) => !unlockedIds.has(b.id))
    .filter((b) => b.condition.type !== "special" || b.condition.value === 1)
    .map((badge) => {
      let currentValue = 0
      let targetValue = badge.condition.value

      switch (badge.condition.type) {
        case "messages":
          currentValue = stats.messagesSent
          break
        case "friends":
          currentValue = stats.friendsCount
          break
        case "days":
          currentValue = stats.daysActive
          break
        case "rooms":
          currentValue = stats.roomsCreated
          break
        case "level":
          currentValue = stats.level
          break
        case "xp":
          currentValue = stats.xp
          break
      }

      const progress = targetValue > 0 ? Math.min(100, (currentValue / targetValue) * 100) : 0

      return {
        ...badge,
        progress,
        currentValue,
      }
    })
}

/**
 * Get display badge (primary badge to show next to username)
 */
export function getDisplayBadge(user: User, roomsCreated: number = 0): Badge | null {
  const unlocked = getUnlockedBadges(user, roomsCreated)
  
  // Sort by rarity (highest first)
  const rarityOrder = ["mythic", "legendary", "epic", "rare", "common"]
  unlocked.sort((a, b) => {
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
  })

  return unlocked[0] || null
}

/**
 * Get top N badges to display
 */
export function getTopBadges(user: User, roomsCreated: number = 0, count: number = 3): Badge[] {
  const unlocked = getUnlockedBadges(user, roomsCreated)
  
  const rarityOrder = ["mythic", "legendary", "epic", "rare", "common"]
  unlocked.sort((a, b) => {
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
  })

  return unlocked.slice(0, count)
}

/**
 * Get rarity color classes
 */
export function getRarityConfig(rarity: string) {
  return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common
}

/**
 * Get badge unlock progress text
 */
export function getProgressText(badge: Badge, currentValue: number): string {
  const condition = badge.condition
  const target = condition.value

  switch (condition.type) {
    case "messages":
      return `${currentValue}/${target} رسالة`
    case "friends":
      return `${currentValue}/${target} صديق`
    case "days":
      return `${currentValue}/${target} يوم`
    case "rooms":
      return `${currentValue}/${target} غرفة`
    case "level":
      return `المستوى ${currentValue}/${target}`
    case "xp":
      return `${currentValue}/${target} XP`
    default:
      return ""
  }
}
