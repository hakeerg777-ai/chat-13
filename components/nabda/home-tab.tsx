"use client"

import { useState, useEffect } from "react"
import { useRooms } from "@/hooks/use-rooms"
import { ROOM_ICONS } from "@/lib/constants"
import { formatRelative } from "@/lib/constants"
import { RoomChat } from "./room-chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Plus, Users, Loader2, RefreshCw } from "lucide-react"
import type { UserProfile, Room } from "@/lib/types"
import { UserAvatar } from "./avatar-upload"

interface HomeTabProps {
  currentUser: UserProfile
  onRoomCountChange?: (count: number) => void
}

export function HomeTab({ currentUser, onRoomCountChange }: HomeTabProps) {
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: "", desc: "", icon: "🎮" })
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)
  const [showPublic, setShowPublic] = useState(false)

  const { myRooms, publicRooms, loading, createRoom, joinRoom, loadPublicRooms } = useRooms(currentUser)

  // Notify parent of room count so NabdaApp doesn't need a second useRooms listener
  useEffect(() => {
    onRoomCountChange?.(myRooms.length)
  }, [myRooms.length, onRoomCountChange])

  const handleCreate = async () => {
    if (!newRoom.name.trim()) return
    setCreating(true)
    const room = await createRoom(newRoom.name, newRoom.desc, newRoom.icon)
    if (room) {
      setShowCreate(false)
      setNewRoom({ name: "", desc: "", icon: "🎮" })
      setActiveRoom(room)
    }
    setCreating(false)
  }

  const handleJoin = async (room: Room) => {
    setJoining(room.id)
    await joinRoom(room.id)
    setActiveRoom({ ...room, memberCount: room.memberCount + 1 })
    setJoining(null)
  }

  const handleExplore = async () => {
    setShowPublic(true)
    await loadPublicRooms()
  }

  if (activeRoom) {
    return <RoomChat room={activeRoom} currentUser={currentUser} onBack={() => setActiveRoom(null)} />
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-l from-primary/15 via-purple-500/10 to-transparent border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>✨</span><span>نبضة</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date().toLocaleDateString("ar-SA", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <UserAvatar
            emojiAvatar={currentUser.avatar}
            color={currentUser.color}
            photoURL={currentUser.photoURL}
            username={currentUser.username}
            size="md"
          />
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* My Rooms */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🏠</span><span>غرفي</span>
          </h2>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="h-8 gap-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            غرفة جديدة
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : myRooms.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-4xl mb-2">🏠</p>
            <p className="text-sm">لم تنضم لأي غرفة بعد</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {myRooms.map((room) => (
              <Card
                key={room.id}
                className="cursor-pointer hover:scale-[1.02] transition-transform bg-card/50 border-white/10 overflow-hidden"
                onClick={() => setActiveRoom(room)}
                style={{ borderColor: `${room.color}30`, background: `linear-gradient(135deg, ${room.color}10, transparent)` }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${room.color}40, ${room.color}15)` }}
                  >
                    {room.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base flex items-center gap-1.5">
                      {room.name}
                      {!room.isPublic && (
                        <span className="text-[10px] font-medium bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/30">
                          💬 خاص
                        </span>
                      )}
                    </p>
                    {room.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {room.lastMessage}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {room.memberCount}
                      {room.lastMessageAt && (
                        <span className="mr-2">{formatRelative(room.lastMessageAt)}</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Explore Public Rooms */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🌍</span><span>استكشف</span>
          </h2>
          <Button variant="ghost" size="sm" onClick={handleExplore} className="h-8 gap-1 text-muted-foreground">
            <RefreshCw className="w-3 h-3" />
            تحديث
          </Button>
        </div>

        {showPublic && (
          <div className="space-y-3">
            {publicRooms.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">لا توجد غرف عامة متاحة</p>
            ) : (
              publicRooms.map((room) => (
                <Card key={room.id} className="bg-card/50 border-white/10">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${room.color}40, ${room.color}15)` }}
                    >
                      {room.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{room.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{room.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />{room.memberCount}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleJoin(room)}
                      disabled={joining === room.id}
                      className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 flex-shrink-0"
                      variant="outline"
                    >
                      {joining === room.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "انضم"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Room Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-white/10 w-[calc(100vw-2rem)] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>إنشاء غرفة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>اسم الغرفة</Label>
              <Input
                placeholder="مثل: غرفة الألعاب"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف (اختياري)</Label>
              <Input
                placeholder="وصف قصير للغرفة"
                value={newRoom.desc}
                onChange={(e) => setNewRoom({ ...newRoom, desc: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>أيقونة الغرفة</Label>
              <div className="flex flex-wrap gap-2">
                {ROOM_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewRoom({ ...newRoom, icon })}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all",
                      newRoom.icon === icon
                        ? "bg-primary/30 border-2 border-primary scale-110"
                        : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={!newRoom.name.trim() || creating}
              className="w-full bg-gradient-to-l from-primary to-blue-500"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              {creating ? "جاري الإنشاء..." : "إنشاء الغرفة 🏠"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
