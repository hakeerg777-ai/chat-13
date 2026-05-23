"use client"

import { useState, useEffect } from "react"
import { useFriends } from "@/hooks/use-friends"
import { getLevelInfo } from "@/lib/constants"
import { RoomChat } from "./room-chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, X, UserPlus, Check, Loader2 } from "lucide-react"
import type { UserProfile, Room } from "@/lib/types"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { UserAvatar } from "./avatar-upload"

interface FriendsTabProps {
  currentUser: UserProfile
  updateProfile: (u: Partial<UserProfile>) => Promise<void>
}

export function FriendsTab({ currentUser, updateProfile }: FriendsTabProps) {
  const [search, setSearch] = useState("")
  const [friends, setFriends] = useState<UserProfile[]>([])
  const [activeDM, setActiveDM] = useState<Room | null>(null)
  const [loadingDM, setLoadingDM] = useState<string | null>(null)
  const [adding, setAdding] = useState<string | null>(null)

  const { searchResults, searching, searchUsers, addFriend, removeFriend, getFriendProfiles, getOrCreateDM } =
    useFriends(currentUser, updateProfile)

  // Load friend profiles on mount / when friends list changes
  useEffect(() => {
    getFriendProfiles().then(setFriends)
  }, [currentUser.friends.join(",")])

  const handleSearch = (value: string) => {
    setSearch(value)
    searchUsers(value)
  }

  const handleAdd = async (uid: string) => {
    setAdding(uid)
    await addFriend(uid)
    setAdding(null)
  }

  const handleOpenDM = async (friendUid: string) => {
    setLoadingDM(friendUid)
    const roomId = await getOrCreateDM(friendUid)
    // Fetch room data
    const snap = await getDoc(doc(db, "rooms", roomId))
    if (snap.exists()) {
      setActiveDM({ id: snap.id, ...snap.data() } as Room)
    }
    setLoadingDM(null)
  }

  if (activeDM) {
    return <RoomChat room={activeDM} currentUser={currentUser} onBack={() => setActiveDM(null)} />
  }

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span>👥</span><span>الأصدقاء</span>
      </h1>

      {/* Search */}
      <Input
        placeholder="🔍 ابحث عن مستخدم..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-5 bg-white/5 border-white/10 focus:border-primary/50"
      />

      {/* Search Results */}
      {search.length > 1 && (
        <div className="mb-6">
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <span>🔍</span><span>نتائج البحث</span>
          </h2>
          {searching ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">لا توجد نتائج</p>
          ) : (
            <div className="space-y-3">
              {searchResults.map((user) => {
                const levelInfo = getLevelInfo(user.xp)
                const isFriend = currentUser.friends.includes(user.uid)
                return (
                  <Card key={user.uid} className="bg-card/50 border-white/10">
                    <CardContent className="p-4 flex items-center gap-3">
                      <UserAvatar
                        emojiAvatar={user.avatar}
                        color={user.color}
                        photoURL={user.photoURL}
                        username={user.username}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold">{user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {levelInfo.current.icon} {levelInfo.current.title}
                        </p>
                      </div>
                      {!isFriend ? (
                        <Button
                          size="sm"
                          onClick={() => handleAdd(user.uid)}
                          disabled={adding === user.uid}
                          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 gap-1"
                          variant="outline"
                        >
                          {adding === user.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                          إضافة
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-emerald-500">
                          <Check className="w-4 h-4" />
                          صديق
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Friends List */}
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        <span>💛</span><span>أصدقائي ({friends.length})</span>
      </h2>

      {friends.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-4xl mb-2">👥</p>
          <p className="text-sm">لا أصدقاء بعد، ابحث عن أشخاص!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map((friend) => {
            const levelInfo = getLevelInfo(friend.xp)
            return (
              <Card key={friend.uid} className="bg-card/50 border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <UserAvatar
                    emojiAvatar={friend.avatar}
                    color={friend.color}
                    photoURL={friend.photoURL}
                    username={friend.username}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{friend.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {levelInfo.current.icon} {levelInfo.current.title}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenDM(friend.uid)}
                      disabled={loadingDM === friend.uid}
                      className="w-9 h-9 text-primary hover:bg-primary/10"
                    >
                      {loadingDM === friend.uid
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <MessageCircle className="w-4 h-4" />
                      }
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFriend(friend.uid)}
                      className="w-9 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
