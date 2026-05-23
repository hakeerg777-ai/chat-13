"use client"

import { Home, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "home" | "friends" | "profile"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const TABS = [
  { id: "home" as Tab, label: "الرئيسية", icon: Home },
  { id: "friends" as Tab, label: "الأصدقاء", icon: Users },
  { id: "profile" as Tab, label: "حسابي", icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-white/10">
      <div className="flex">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors",
              activeTab === id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("w-5 h-5", activeTab === id && "fill-primary/20")} />
            <span className="text-[10px] font-medium">{label}</span>
            {activeTab === id && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
