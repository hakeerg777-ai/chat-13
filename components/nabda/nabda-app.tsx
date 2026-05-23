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
  const [roomCount, setRoomCount] = useState(0)

  const { user, profile, loading, register, login, logout, updateUserProfile } = useAuth()

  // Presence system
  usePresence(user?.uid ?? null, profile?.username)

  // 🔥 1. أول شيء: التحميل العام
  if (loading) {
    return <SplashScreen />
  }

  // 🔥 2. إذا ما فيه مستخدم نهائيًا
  if (!user) {
    return (
      <AuthScreen
        onLogin={login}
        onRegister={register}
      />
    )
  }

  // 🔥 3. المستخدم موجود لكن البروفايل لسه ما وصل (مهم جدًا)
  if (user && profile === null) {
    return <SplashScreen />
  }

  // 🔥 4. حماية إضافية (Type safety)
  if (!profile) {
    return <SplashScreen />
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* HomeTab is always mounted */}
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
