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

  usePresence(user?.uid ?? null, profile?.username)

  // ① لا يزال Firebase يتحقق من الجلسة — أو profile قيد التحميل
  if (loading) {
    return <SplashScreen />
  }

  // ② لا يوجد مستخدم مسجّل إطلاقاً — اعرض شاشة الدخول
  if (!user) {
    return (
      <AuthScreen
        onLogin={login}
        onRegister={register}
      />
    )
  }

  // ③ المستخدم مسجّل لكن profile لا تزال null (نادر — مثلاً أُنشئ الحساب من مكان آخر)
  // نُبقي على SplashScreen بدلاً من إعادته لشاشة التسجيل
  if (!profile) {
    return <SplashScreen />
  }

  // ④ مستخدم مسجّل + profile محمّلة ✅
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* HomeTab mounted دائماً للحفاظ على مستمع الغرف */}
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
