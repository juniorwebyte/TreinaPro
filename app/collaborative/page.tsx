"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  type Room,
  type User,
  type ChatMessage,
  type CodeSnippet,
  loadRooms,
  saveRooms,
  loadCurrentUser,
  saveCurrentUser,
  createUser,
  createRoom,
  joinRoom,
  leaveRoom,
  sendMessage,
  shareCode,
  addCodeComment,
  getRoomStats,
  getRoomTypeInfo,
} from "@/lib/collaborative"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  BookOpen,
  Code2,
  Eye,
  Home,
  Lock,
  MessageSquare,
  MoreVertical,
  Plus,
  Send,
  Share2,
  Users,
  UserPlus,
  LogOut,
  Circle,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"

// ============================================================================
// Mapeamento de Ícones
// ============================================================================

const ROOM_ICONS: Record<string, React.ElementType> = {
  BookOpen,
  Users,
  Eye,
  MessageSquare,
}

// ============================================================================
// Componente UserSetup - Configuração inicial do usuário
// ============================================================================

interface UserSetupProps {
  onComplete: (user: User) => void
}

function UserSetup({ onComplete }: UserSetupProps) {
  const [name, setName] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() && !isAnonymous) return
    const user = createUser(name.trim(), isAnonymous)
    saveCurrentUser(user)
    onComplete(user)
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="size-8 text-primary" />
          </div>
          <CardTitle>Bem-vindo ao Modo Colaborativo</CardTitle>
          <CardDescription>
            Estude com outros cadetes da 42 em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Seu nome de usuário
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cadet42"
                disabled={isAnonymous}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="size-4 rounded border-input"
              />
              <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                Entrar como anônimo
              </label>
            </div>
            
            <Button type="submit" className="w-full" disabled={!name.trim() && !isAnonymous}>
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Componente RoomCard - Card de sala na listagem
// ============================================================================

interface RoomCardProps {
  room: Room
  onJoin: () => void
}

function RoomCard({ room, onJoin }: RoomCardProps) {
  const typeInfo = getRoomTypeInfo(room.type)
  const Icon = ROOM_ICONS[typeInfo.icon] || BookOpen
  
  return (
    <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg" onClick={onJoin}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${typeInfo.color}20` }}
            >
              <Icon className="size-5" style={{ color: typeInfo.color }} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                {room.name}
                {room.isPrivate && <Lock className="size-3 text-muted-foreground" />}
              </CardTitle>
              <CardDescription className="text-xs">
                {typeInfo.label} • por {room.hostName}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {room.participants.length}/{room.maxParticipants}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
        
        {room.topic && (
          <Badge variant="secondary" className="text-xs">
            {room.topic}
          </Badge>
        )}
        
        {/* Avatares dos participantes */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {room.participants.slice(0, 5).map((p, i) => (
              <Avatar key={p.id} className="size-6 border-2 border-background">
                <AvatarFallback className="text-xs">{p.avatar}</AvatarFallback>
              </Avatar>
            ))}
            {room.participants.length > 5 && (
              <div className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px]">
                +{room.participants.length - 5}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {room.participants.length} online
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Componente ChatPanel - Painel de chat
// ============================================================================

interface ChatPanelProps {
  messages: ChatMessage[]
  currentUserId: string
  onSendMessage: (content: string) => void
}

function ChatPanel({ messages, currentUserId, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  
  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput("")
  }
  
  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === "system" ? (
                <div className="text-center text-xs text-muted-foreground">
                  {msg.content}
                </div>
              ) : (
                <div className={cn(
                  "flex gap-2",
                  msg.userId === currentUserId && "flex-row-reverse"
                )}>
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback>{msg.userAvatar}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "max-w-[70%] rounded-lg px-3 py-2",
                    msg.userId === currentUserId 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary"
                  )}>
                    {msg.userId !== currentUserId && (
                      <p className="mb-1 text-xs font-medium opacity-70">{msg.userName}</p>
                    )}
                    {msg.type === "code" ? (
                      <pre className="overflow-x-auto rounded bg-background/50 p-2 font-mono text-xs">
                        <code>{msg.content}</code>
                      </pre>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <p className="mt-1 text-[10px] opacity-50">
                      {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Componente CodeSharePanel - Painel de código compartilhado
// ============================================================================

interface CodeSharePanelProps {
  snippets: CodeSnippet[]
  currentUser: User
  onShareCode: (title: string, code: string) => void
  onAddComment: (snippetId: string, content: string) => void
}

function CodeSharePanel({ snippets, currentUser, onShareCode, onAddComment }: CodeSharePanelProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [code, setCode] = useState("")
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null)
  const [comment, setComment] = useState("")
  
  const handleShare = () => {
    if (!title.trim() || !code.trim()) return
    onShareCode(title.trim(), code.trim())
    setTitle("")
    setCode("")
    setShowShareDialog(false)
  }
  
  const handleAddComment = () => {
    if (!selectedSnippet || !comment.trim()) return
    onAddComment(selectedSnippet.id, comment.trim())
    setComment("")
  }
  
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold">Código Compartilhado</h3>
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 size-4" />
              Compartilhar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compartilhar Código</DialogTitle>
              <DialogDescription>
                Compartilhe um trecho de código com a sala
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Título</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Minha implementação de ft_strlen"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Código</label>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Cole seu código aqui..."
                  className="h-48 font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleShare} disabled={!title.trim() || !code.trim()}>
                <Share2 className="mr-2 size-4" />
                Compartilhar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Snippets */}
      <ScrollArea className="flex-1 p-4">
        {snippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Code2 className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum código compartilhado ainda</p>
            <p className="text-sm text-muted-foreground">
              Seja o primeiro a compartilhar!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {snippets.map((snippet) => (
              <Card key={snippet.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">{snippet.title}</CardTitle>
                      <CardDescription className="text-xs">
                        por {snippet.userName} • {new Date(snippet.createdAt).toLocaleTimeString("pt-BR")}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">C</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <pre className="max-h-48 overflow-auto rounded-lg bg-secondary p-3 font-mono text-xs">
                    <code>{snippet.code}</code>
                  </pre>
                  
                  {/* Comentários */}
                  {snippet.comments.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Comentários ({snippet.comments.length})
                      </p>
                      {snippet.comments.map((c) => (
                        <div key={c.id} className="flex gap-2 rounded bg-secondary/50 p-2">
                          <span className="text-xs font-medium">{c.userName}:</span>
                          <span className="text-xs text-muted-foreground">{c.content}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Adicionar comentário */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar comentário..."
                      className="h-8 text-xs"
                      value={selectedSnippet?.id === snippet.id ? comment : ""}
                      onFocus={() => setSelectedSnippet(snippet)}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && selectedSnippet?.id === snippet.id) {
                          handleAddComment()
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedSnippet(snippet)
                        handleAddComment()
                      }}
                      disabled={!comment.trim() || selectedSnippet?.id !== snippet.id}
                    >
                      <MessageCircle className="size-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// ============================================================================
// Componente ParticipantsList - Lista de participantes
// ============================================================================

interface ParticipantsListProps {
  participants: User[]
  hostId: string
  currentUserId: string
}

function ParticipantsList({ participants, hostId, currentUserId }: ParticipantsListProps) {
  return (
    <div className="space-y-2 p-4">
      <h3 className="mb-3 text-sm font-medium">
        Participantes ({participants.length})
      </h3>
      {participants.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary">
          <div className="relative">
            <Avatar className="size-8">
              <AvatarFallback>{p.avatar}</AvatarFallback>
            </Avatar>
            <Circle 
              className={cn(
                "absolute -bottom-0.5 -right-0.5 size-3 fill-current",
                p.status === "online" && "text-green-500",
                p.status === "away" && "text-yellow-500",
                p.status === "busy" && "text-red-500"
              )} 
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {p.name}
              {p.id === currentUserId && " (você)"}
            </p>
            <p className="text-xs text-muted-foreground">
              {p.id === hostId ? "Host" : "Participante"}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Componente RoomView - Visualização da sala
// ============================================================================

interface RoomViewProps {
  room: Room
  currentUser: User
  onLeave: () => void
  onSendMessage: (content: string) => void
  onShareCode: (title: string, code: string) => void
  onAddComment: (snippetId: string, content: string) => void
}

function RoomView({ 
  room, 
  currentUser, 
  onLeave, 
  onSendMessage,
  onShareCode,
  onAddComment,
}: RoomViewProps) {
  const typeInfo = getRoomTypeInfo(room.type)
  
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-background p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onLeave}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="font-semibold">{room.name}</h1>
            <p className="text-xs text-muted-foreground">
              {typeInfo.label} • {room.participants.length} participantes
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onLeave} className="text-destructive">
              <LogOut className="mr-2 size-4" />
              Sair da Sala
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat e Código */}
        <div className="flex-1 border-r">
          <Tabs defaultValue="chat" className="flex h-full flex-col">
            <TabsList className="m-2">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="size-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code2 className="size-4" />
                Código
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="mt-0 flex-1">
              <ChatPanel
                messages={room.messages}
                currentUserId={currentUser.id}
                onSendMessage={onSendMessage}
              />
            </TabsContent>
            <TabsContent value="code" className="mt-0 flex-1">
              <CodeSharePanel
                snippets={room.sharedCode}
                currentUser={currentUser}
                onShareCode={onShareCode}
                onAddComment={onAddComment}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar - Participantes */}
        <div className="hidden w-64 md:block">
          <ParticipantsList
            participants={room.participants}
            hostId={room.hostId}
            currentUserId={currentUser.id}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Componente CreateRoomDialog - Dialog para criar sala
// ============================================================================

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, description: string, type: Room["type"], topic?: string) => void
}

function CreateRoomDialog({ open, onOpenChange, onCreate }: CreateRoomDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<Room["type"]>("study")
  const [topic, setTopic] = useState("")
  
  const handleCreate = () => {
    if (!name.trim()) return
    onCreate(name.trim(), description.trim(), type, topic.trim() || undefined)
    setName("")
    setDescription("")
    setType("study")
    setTopic("")
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Sala</DialogTitle>
          <DialogDescription>
            Crie uma sala para estudar com outros cadetes
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Nome da Sala</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Exam02 - Nível 1"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium">Descrição</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo da sala..."
              className="h-20"
            />
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium">Tipo de Sala</label>
            <div className="grid grid-cols-2 gap-2">
              {(["study", "pair", "review", "discussion"] as const).map((t) => {
                const info = getRoomTypeInfo(t)
                const Icon = ROOM_ICONS[info.icon] || BookOpen
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-3 text-left transition-colors",
                      type === t ? "border-primary bg-primary/10" : "hover:bg-secondary"
                    )}
                  >
                    <Icon className="size-4" style={{ color: info.color }} />
                    <span className="text-sm">{info.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium">Tópico (opcional)</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: ft_split, ponteiros..."
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Criar Sala
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Componente Principal - Página Colaborativa
// ============================================================================

export default function CollaborativePage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  // Carrega dados iniciais
  useEffect(() => {
    setRooms(loadRooms())
    const user = loadCurrentUser()
    if (user) setCurrentUser(user)
  }, [])
  
  // Sincroniza a sala atual com a lista de salas
  useEffect(() => {
    if (currentRoom) {
      const updated = rooms.find(r => r.id === currentRoom.id)
      if (updated) setCurrentRoom(updated)
    }
  }, [rooms, currentRoom])
  
  // Handlers
  const handleJoinRoom = useCallback((roomId: string) => {
    if (!currentUser) return
    const newRooms = joinRoom(rooms, roomId, currentUser)
    setRooms(newRooms)
    saveRooms(newRooms)
    const room = newRooms.find(r => r.id === roomId)
    if (room) setCurrentRoom(room)
  }, [currentUser, rooms])
  
  const handleLeaveRoom = useCallback(() => {
    if (!currentUser || !currentRoom) return
    const newRooms = leaveRoom(rooms, currentRoom.id, currentUser.id)
    setRooms(newRooms)
    saveRooms(newRooms)
    setCurrentRoom(null)
  }, [currentUser, currentRoom, rooms])
  
  const handleSendMessage = useCallback((content: string) => {
    if (!currentUser || !currentRoom) return
    const newRooms = sendMessage(rooms, currentRoom.id, currentUser, content)
    setRooms(newRooms)
    saveRooms(newRooms)
  }, [currentUser, currentRoom, rooms])
  
  const handleShareCode = useCallback((title: string, code: string) => {
    if (!currentUser || !currentRoom) return
    const newRooms = shareCode(rooms, currentRoom.id, currentUser, title, code, "c")
    setRooms(newRooms)
    saveRooms(newRooms)
  }, [currentUser, currentRoom, rooms])
  
  const handleAddComment = useCallback((snippetId: string, content: string) => {
    if (!currentUser || !currentRoom) return
    const newRooms = addCodeComment(rooms, currentRoom.id, snippetId, currentUser, content)
    setRooms(newRooms)
    saveRooms(newRooms)
  }, [currentUser, currentRoom, rooms])
  
  const handleCreateRoom = useCallback((
    name: string, 
    description: string, 
    type: Room["type"],
    topic?: string
  ) => {
    if (!currentUser) return
    const room = createRoom(name, description, type, currentUser, false, undefined, topic)
    const newRooms = [...rooms, room]
    setRooms(newRooms)
    saveRooms(newRooms)
    setCurrentRoom(room)
  }, [currentUser, rooms])
  
  // Se não tem usuário, mostra tela de setup
  if (!currentUser) {
    return <UserSetup onComplete={setCurrentUser} />
  }
  
  // Se está em uma sala, mostra a sala
  if (currentRoom) {
    return (
      <RoomView
        room={currentRoom}
        currentUser={currentUser}
        onLeave={handleLeaveRoom}
        onSendMessage={handleSendMessage}
        onShareCode={handleShareCode}
        onAddComment={handleAddComment}
      />
    )
  }
  
  // Lista de salas
  const stats = getRoomStats(rooms)
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="mr-2 size-4" />
                Início
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <span className="font-semibold">Modo Colaborativo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="size-6">
                <AvatarFallback className="text-xs">{currentUser.avatar}</AvatarFallback>
              </Avatar>
              {currentUser.name}
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 size-4" />
              Criar Sala
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-6">
        <div className="space-y-6">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Estude em Grupo</h1>
            <p className="mt-2 text-muted-foreground">
              Conecte-se com outros cadetes da 42 para estudar juntos
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <BookOpen className="size-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalRooms}</p>
                  <p className="text-xs text-muted-foreground">Salas Ativas</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Users className="size-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  <p className="text-xs text-muted-foreground">Usuários Online</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <MessageSquare className="size-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.messagesExchanged}</p>
                  <p className="text-xs text-muted-foreground">Mensagens</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <Code2 className="size-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.codeSnippetsShared}</p>
                  <p className="text-xs text-muted-foreground">Códigos Compartilhados</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Rooms */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Salas Disponíveis</h2>
              <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
                <UserPlus className="mr-2 size-4" />
                Nova Sala
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={() => handleJoinRoom(room.id)}
                />
              ))}
            </div>
            
            {rooms.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="mx-auto mb-4 size-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhuma sala disponível</p>
                <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                  Criar a Primeira Sala
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      {/* Create Room Dialog */}
      <CreateRoomDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateRoom}
      />
    </div>
  )
}
