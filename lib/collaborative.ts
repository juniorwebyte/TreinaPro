// ============================================================================
// Sistema de Modo Colaborativo
// ============================================================================
// Simula salas de estudo em grupo com chat e compartilhamento de código
// Usa localStorage para persistir dados (demo sem backend real)
// ============================================================================

// Tipos para o sistema colaborativo
export interface User {
  id: string
  name: string
  avatar: string  // URL ou emoji
  isAnonymous: boolean
  joinedAt: number
  status: "online" | "away" | "busy"
}

export interface ChatMessage {
  id: string
  roomId: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  type: "text" | "code" | "system"
  timestamp: number
  codeLanguage?: string
}

export interface CodeSnippet {
  id: string
  roomId: string
  userId: string
  userName: string
  title: string
  code: string
  language: string
  createdAt: number
  comments: CodeComment[]
}

export interface CodeComment {
  id: string
  snippetId: string
  userId: string
  userName: string
  content: string
  lineNumber?: number
  timestamp: number
}

export interface Room {
  id: string
  name: string
  description: string
  type: "study" | "pair" | "review" | "discussion"
  hostId: string
  hostName: string
  participants: User[]
  messages: ChatMessage[]
  sharedCode: CodeSnippet[]
  maxParticipants: number
  isPrivate: boolean
  password?: string
  createdAt: number
  topic?: string
}

export interface RoomStats {
  totalRooms: number
  activeUsers: number
  messagesExchanged: number
  codeSnippetsShared: number
}

// ============================================================================
// Dados de Demonstração
// ============================================================================

const DEMO_AVATARS = ["🧑‍💻", "👨‍💻", "👩‍💻", "🤓", "😎", "🦊", "🐱", "🐶", "🦁", "🐼"]
const DEMO_NAMES = [
  "Cadet42", "Norminator", "MallocMaster", "PointerPro", 
  "SegFaulter", "BitWizard", "StackSmasher", "HeapHero",
  "GitGuru", "MakefileMaven"
]

function generateDemoUsers(count: number): User[] {
  const users: User[] = []
  for (let i = 0; i < count; i++) {
    users.push({
      id: `user-${i}`,
      name: DEMO_NAMES[i % DEMO_NAMES.length],
      avatar: DEMO_AVATARS[i % DEMO_AVATARS.length],
      isAnonymous: false,
      joinedAt: Date.now() - Math.random() * 3600000,
      status: Math.random() > 0.3 ? "online" : Math.random() > 0.5 ? "away" : "busy",
    })
  }
  return users
}

const DEMO_MESSAGES: Omit<ChatMessage, "id" | "roomId" | "timestamp">[] = [
  { userId: "user-0", userName: "Cadet42", userAvatar: "🧑‍💻", content: "Alguém pode me ajudar com ft_split?", type: "text" },
  { userId: "user-1", userName: "Norminator", userAvatar: "👨‍💻", content: "Qual parte está difícil?", type: "text" },
  { userId: "user-0", userName: "Cadet42", userAvatar: "🧑‍💻", content: "Não entendo como contar as palavras primeiro", type: "text" },
  { userId: "user-2", userName: "MallocMaster", userAvatar: "👩‍💻", content: "Você precisa fazer uma primeira passada contando, depois aloca, e depois preenche", type: "text" },
  { userId: "user-1", userName: "Norminator", userAvatar: "👨‍💻", content: "Exato! Duas passadas pela string", type: "text" },
]

export const DEMO_ROOMS: Room[] = [
  {
    id: "room-1",
    name: "Exam02 - Nível 0",
    description: "Estudando ft_putchar, ft_swap e ft_strlen",
    type: "study",
    hostId: "user-0",
    hostName: "Cadet42",
    participants: generateDemoUsers(4),
    messages: DEMO_MESSAGES.map((m, i) => ({
      ...m,
      id: `msg-${i}`,
      roomId: "room-1",
      timestamp: Date.now() - (DEMO_MESSAGES.length - i) * 60000,
    })),
    sharedCode: [
      {
        id: "code-1",
        roomId: "room-1",
        userId: "user-2",
        userName: "MallocMaster",
        title: "ft_strlen simplificado",
        code: `int ft_strlen(char *str)
{
    int i;

    i = 0;
    while (str[i])
        i++;
    return (i);
}`,
        language: "c",
        createdAt: Date.now() - 1800000,
        comments: [
          {
            id: "comment-1",
            snippetId: "code-1",
            userId: "user-1",
            userName: "Norminator",
            content: "Perfeito! Bem simples e direto.",
            timestamp: Date.now() - 1700000,
          }
        ],
      }
    ],
    maxParticipants: 10,
    isPrivate: false,
    createdAt: Date.now() - 7200000,
    topic: "Nível 0 - Funções básicas",
  },
  {
    id: "room-2",
    name: "Pair Programming - ft_split",
    description: "Trabalhando juntos na implementação do split",
    type: "pair",
    hostId: "user-3",
    hostName: "PointerPro",
    participants: generateDemoUsers(2),
    messages: [
      {
        id: "msg-pair-1",
        roomId: "room-2",
        userId: "user-3",
        userName: "PointerPro",
        userAvatar: "🤓",
        content: "Vamos começar pelo count_words primeiro?",
        type: "text",
        timestamp: Date.now() - 300000,
      },
      {
        id: "msg-pair-2",
        roomId: "room-2",
        userId: "user-4",
        userName: "SegFaulter",
        userAvatar: "😎",
        content: "Sim, faz sentido. Assim sabemos quanto alocar.",
        type: "text",
        timestamp: Date.now() - 240000,
      },
    ],
    sharedCode: [],
    maxParticipants: 2,
    isPrivate: false,
    createdAt: Date.now() - 3600000,
    topic: "ft_split",
  },
  {
    id: "room-3",
    name: "Code Review - get_next_line",
    description: "Revisando implementações do GNL",
    type: "review",
    hostId: "user-5",
    hostName: "BitWizard",
    participants: generateDemoUsers(5),
    messages: [
      {
        id: "msg-review-1",
        roomId: "room-3",
        userId: "user-5",
        userName: "BitWizard",
        userAvatar: "🦊",
        content: "Quem quer compartilhar o código primeiro?",
        type: "text",
        timestamp: Date.now() - 600000,
      },
    ],
    sharedCode: [],
    maxParticipants: 8,
    isPrivate: false,
    createdAt: Date.now() - 5400000,
    topic: "get_next_line",
  },
  {
    id: "room-4",
    name: "Dúvidas sobre Ponteiros",
    description: "Discussão aberta sobre ponteiros e memória",
    type: "discussion",
    hostId: "user-6",
    hostName: "StackSmasher",
    participants: generateDemoUsers(7),
    messages: [
      {
        id: "msg-disc-1",
        roomId: "room-4",
        userId: "user-6",
        userName: "StackSmasher",
        userAvatar: "🐱",
        content: "Alguém sabe a diferença entre char *str e char str[]?",
        type: "text",
        timestamp: Date.now() - 900000,
      },
      {
        id: "msg-disc-2",
        roomId: "room-4",
        userId: "user-7",
        userName: "HeapHero",
        userAvatar: "🐶",
        content: "char *str aponta pra uma string literal (read-only), char str[] aloca no stack e você pode modificar!",
        type: "text",
        timestamp: Date.now() - 840000,
      },
    ],
    sharedCode: [],
    maxParticipants: 20,
    isPrivate: false,
    createdAt: Date.now() - 10800000,
    topic: "Ponteiros",
  },
]

// ============================================================================
// Funções de Gerenciamento
// ============================================================================

const ROOMS_KEY = "ft_exam_collab_rooms"
const USER_KEY = "ft_exam_collab_user"

export function loadRooms(): Room[] {
  if (typeof window === "undefined") return DEMO_ROOMS
  
  const saved = localStorage.getItem(ROOMS_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return DEMO_ROOMS
    }
  }
  return DEMO_ROOMS
}

export function saveRooms(rooms: Room[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
}

export function loadCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  
  const saved = localStorage.getItem(USER_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return null
    }
  }
  return null
}

export function saveCurrentUser(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function createUser(name: string, isAnonymous: boolean = false): User {
  const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const avatar = DEMO_AVATARS[Math.floor(Math.random() * DEMO_AVATARS.length)]
  
  return {
    id,
    name: isAnonymous ? `Anon${Math.floor(Math.random() * 9999)}` : name,
    avatar,
    isAnonymous,
    joinedAt: Date.now(),
    status: "online",
  }
}

export function createRoom(
  name: string,
  description: string,
  type: Room["type"],
  host: User,
  isPrivate: boolean = false,
  password?: string,
  topic?: string
): Room {
  return {
    id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    type,
    hostId: host.id,
    hostName: host.name,
    participants: [host],
    messages: [
      {
        id: `msg-system-${Date.now()}`,
        roomId: "",
        userId: "system",
        userName: "Sistema",
        userAvatar: "🤖",
        content: `Sala "${name}" criada por ${host.name}`,
        type: "system",
        timestamp: Date.now(),
      }
    ],
    sharedCode: [],
    maxParticipants: type === "pair" ? 2 : type === "study" ? 10 : type === "review" ? 8 : 20,
    isPrivate,
    password,
    createdAt: Date.now(),
    topic,
  }
}

export function joinRoom(rooms: Room[], roomId: string, user: User): Room[] {
  return rooms.map(room => {
    if (room.id !== roomId) return room
    if (room.participants.find(p => p.id === user.id)) return room
    if (room.participants.length >= room.maxParticipants) return room
    
    return {
      ...room,
      participants: [...room.participants, user],
      messages: [
        ...room.messages,
        {
          id: `msg-${Date.now()}`,
          roomId: room.id,
          userId: "system",
          userName: "Sistema",
          userAvatar: "🤖",
          content: `${user.name} entrou na sala`,
          type: "system" as const,
          timestamp: Date.now(),
        }
      ],
    }
  })
}

export function leaveRoom(rooms: Room[], roomId: string, userId: string): Room[] {
  return rooms.map(room => {
    if (room.id !== roomId) return room
    
    const user = room.participants.find(p => p.id === userId)
    if (!user) return room
    
    return {
      ...room,
      participants: room.participants.filter(p => p.id !== userId),
      messages: [
        ...room.messages,
        {
          id: `msg-${Date.now()}`,
          roomId: room.id,
          userId: "system",
          userName: "Sistema",
          userAvatar: "🤖",
          content: `${user.name} saiu da sala`,
          type: "system" as const,
          timestamp: Date.now(),
        }
      ],
    }
  })
}

export function sendMessage(
  rooms: Room[],
  roomId: string,
  user: User,
  content: string,
  type: "text" | "code" = "text",
  codeLanguage?: string
): Room[] {
  const message: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    roomId,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    content,
    type,
    timestamp: Date.now(),
    codeLanguage,
  }
  
  return rooms.map(room => {
    if (room.id !== roomId) return room
    return {
      ...room,
      messages: [...room.messages, message],
    }
  })
}

export function shareCode(
  rooms: Room[],
  roomId: string,
  user: User,
  title: string,
  code: string,
  language: string
): Room[] {
  const snippet: CodeSnippet = {
    id: `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    roomId,
    userId: user.id,
    userName: user.name,
    title,
    code,
    language,
    createdAt: Date.now(),
    comments: [],
  }
  
  return rooms.map(room => {
    if (room.id !== roomId) return room
    return {
      ...room,
      sharedCode: [...room.sharedCode, snippet],
      messages: [
        ...room.messages,
        {
          id: `msg-${Date.now()}`,
          roomId: room.id,
          userId: "system",
          userName: "Sistema",
          userAvatar: "🤖",
          content: `${user.name} compartilhou código: "${title}"`,
          type: "system" as const,
          timestamp: Date.now(),
        }
      ],
    }
  })
}

export function addCodeComment(
  rooms: Room[],
  roomId: string,
  snippetId: string,
  user: User,
  content: string,
  lineNumber?: number
): Room[] {
  const comment: CodeComment = {
    id: `comment-${Date.now()}`,
    snippetId,
    userId: user.id,
    userName: user.name,
    content,
    lineNumber,
    timestamp: Date.now(),
  }
  
  return rooms.map(room => {
    if (room.id !== roomId) return room
    return {
      ...room,
      sharedCode: room.sharedCode.map(snippet => {
        if (snippet.id !== snippetId) return snippet
        return {
          ...snippet,
          comments: [...snippet.comments, comment],
        }
      }),
    }
  })
}

export function getRoomStats(rooms: Room[]): RoomStats {
  return {
    totalRooms: rooms.length,
    activeUsers: rooms.reduce((sum, r) => sum + r.participants.length, 0),
    messagesExchanged: rooms.reduce((sum, r) => sum + r.messages.length, 0),
    codeSnippetsShared: rooms.reduce((sum, r) => sum + r.sharedCode.length, 0),
  }
}

export function getRoomTypeInfo(type: Room["type"]): { label: string; color: string; icon: string } {
  switch (type) {
    case "study":
      return { label: "Sala de Estudo", color: "#3b82f6", icon: "BookOpen" }
    case "pair":
      return { label: "Pair Programming", color: "#8b5cf6", icon: "Users" }
    case "review":
      return { label: "Code Review", color: "#10b981", icon: "Eye" }
    case "discussion":
      return { label: "Discussão", color: "#f59e0b", icon: "MessageSquare" }
  }
}
