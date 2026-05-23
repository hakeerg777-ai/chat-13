"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { usePresence } from "@/hooks/use-presence"
import { SplashScreen } from "./splash-screen"
import { AuthScreen } from "./auth-screen"
import { HomeTab } from "./home-tab"
import { FriendsTab } from "./friends-tab"
import { ProfileTab } from "./profile-tab"
import { BottomNav } from "./bottom-nav"

type Tab = "home" | "friends" | "profile"

export function NabdaApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home")
  // roomCount is lifted from HomeTab to avoid a duplicate useRooms listener
  const [roomCount, setRoomCount] = useState(0)

  const { user, profile, loading, register, login, logout, updateUserProfile } = useAuth()

  // Presence system — tracks online/offline in Realtime Database
  usePresence(user?.uid ?? null, profile?.username)

  if (loading) {
    return <SplashScreen />
  }

  if (!user || !profile) {
    return (
      <AuthScreen
        onLogin={login}
        onRegister={register}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* HomeTab is always mounted to keep the rooms listener alive */}
      <div className={activeTab === "home" ? "block" : "hidden"}>
        <HomeTab
          currentUser={profile}
          onRoomCountChange={setRoomCount}
        />
      </div>

      {activeTab === "friends" && (
        <FriendsTab
          currentUser={profile}
          updateProfile={updateUserProfile}
        />
      )}
      {activeTab === "profile" && (
        <ProfileTab
          currentUser={profile}
          onUpdateProfile={updateUserProfile}
          onLogout={logout}
          roomCount={roomCount}
        />
      )}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
