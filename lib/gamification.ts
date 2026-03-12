// ==================== SISTEMA DE GAMIFICAÇÃO ====================
// Gerenciamento de XP, Levels, Conquistas, Streaks e Ranking

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "progress" | "streak" | "skill" | "special"
  requirement: number
  unlockedAt?: Date
}

export interface UserProfile {
  id: string
  username: string
  xp: number
  level: number
  streak: number
  bestStreak: number
  totalExercises: number
  exercisesWithoutHint: number
  exercisesWithoutSolution: number
  achievements: string[]
  lastStudyDate: string | null
  createdAt: string
}

export interface XPGain {
  base: number
  bonusNoHint: number
  bonusNoSolution: number
  streakMultiplier: number
  total: number
}

// Configuração de XP
const XP_CONFIG = {
  perExercise: 50,
  bonusNoHint: 25,
  bonusNoSolution: 50,
  streakMultiplier: 0.1, // 10% bonus por dia de streak
  maxStreakBonus: 2.0, // máximo 200% de bonus
}

// Níveis e XP necessário
const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1850, 2400, 3000, // 1-10
  3700, 4500, 5400, 6400, 7500, 8700, 10000, 11500, 13200, 15000, // 11-20
  17000, 19200, 21600, 24200, 27000, 30000, 33200, 36600, 40200, 44000, // 21-30
  48000, 52200, 56600, 61200, 66000, 71000, 76200, 81600, 87200, 93000, // 31-40
  99000, 105200, 111600, 118200, 125000, 132000, 139200, 146600, 154200, 162000, // 41-50
]

// Títulos por nível
export const LEVEL_TITLES: Record<number, string> = {
  1: "Novato",
  5: "Aprendiz",
  10: "Estudante",
  15: "Praticante",
  20: "Competente",
  25: "Proficiente",
  30: "Experiente",
  35: "Especialista",
  40: "Mestre",
  45: "Guru",
  50: "Lenda",
}

// Lista de conquistas disponíveis
export const ACHIEVEMENTS: Achievement[] = [
  // Progresso
  { id: "first_exercise", title: "Primeiro Passo", description: "Complete seu primeiro exercício", icon: "🎯", category: "progress", requirement: 1 },
  { id: "exercises_5", title: "Aquecendo", description: "Complete 5 exercícios", icon: "🔥", category: "progress", requirement: 5 },
  { id: "exercises_10", title: "Em Ritmo", description: "Complete 10 exercícios", icon: "⚡", category: "progress", requirement: 10 },
  { id: "exercises_25", title: "Dedicado", description: "Complete 25 exercícios", icon: "💪", category: "progress", requirement: 25 },
  { id: "exercises_50", title: "Veterano", description: "Complete 50 exercícios", icon: "🏆", category: "progress", requirement: 50 },
  { id: "exercises_100", title: "Centurião", description: "Complete 100 exercícios", icon: "👑", category: "progress", requirement: 100 },
  
  // Streak
  { id: "streak_3", title: "Consistente", description: "3 dias consecutivos de estudo", icon: "📅", category: "streak", requirement: 3 },
  { id: "streak_7", title: "Uma Semana", description: "7 dias consecutivos de estudo", icon: "🗓️", category: "streak", requirement: 7 },
  { id: "streak_14", title: "Duas Semanas", description: "14 dias consecutivos de estudo", icon: "📆", category: "streak", requirement: 14 },
  { id: "streak_30", title: "Um Mês!", description: "30 dias consecutivos de estudo", icon: "🌟", category: "streak", requirement: 30 },
  
  // Skill
  { id: "no_hint_5", title: "Independente", description: "Complete 5 exercícios sem dica", icon: "🧠", category: "skill", requirement: 5 },
  { id: "no_hint_20", title: "Autodidata", description: "Complete 20 exercícios sem dica", icon: "🎓", category: "skill", requirement: 20 },
  { id: "no_solution_5", title: "Determinado", description: "Complete 5 exercícios sem ver solução", icon: "💎", category: "skill", requirement: 5 },
  { id: "no_solution_20", title: "Expert", description: "Complete 20 exercícios sem ver solução", icon: "🏅", category: "skill", requirement: 20 },
  
  // Special
  { id: "level_10", title: "Nível 10", description: "Alcance o nível 10", icon: "🔟", category: "special", requirement: 10 },
  { id: "level_25", title: "Nível 25", description: "Alcance o nível 25", icon: "🎖️", category: "special", requirement: 25 },
  { id: "level_50", title: "Nível Máximo", description: "Alcance o nível 50", icon: "🌈", category: "special", requirement: 50 },
  { id: "xp_1000", title: "1K XP", description: "Acumule 1.000 XP", icon: "✨", category: "special", requirement: 1000 },
  { id: "xp_10000", title: "10K XP", description: "Acumule 10.000 XP", icon: "💫", category: "special", requirement: 10000 },
]

// Storage keys
const STORAGE_KEY = "treino_pro_gamification"

// Funções auxiliares
function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

// Carregar perfil do localStorage
export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") {
    return getDefaultProfile()
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Erro ao carregar perfil:", e)
  }
  
  return getDefaultProfile()
}

// Perfil padrão
function getDefaultProfile(): UserProfile {
  return {
    id: `user_${Date.now()}`,
    username: "Estudante",
    xp: 0,
    level: 1,
    streak: 0,
    bestStreak: 0,
    totalExercises: 0,
    exercisesWithoutHint: 0,
    exercisesWithoutSolution: 0,
    achievements: [],
    lastStudyDate: null,
    createdAt: new Date().toISOString(),
  }
}

// Salvar perfil no localStorage
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch (e) {
    console.error("Erro ao salvar perfil:", e)
  }
}

// Calcular nível baseado no XP
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

// Obter XP necessário para próximo nível
export function getXPForNextLevel(level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000
  }
  return LEVEL_THRESHOLDS[level]
}

// Obter XP do nível atual
export function getXPForCurrentLevel(level: number): number {
  if (level <= 1) return 0
  return LEVEL_THRESHOLDS[level - 1]
}

// Obter título do nível
export function getLevelTitle(level: number): string {
  const titles = Object.entries(LEVEL_TITLES)
    .filter(([lvl]) => parseInt(lvl) <= level)
    .sort(([a], [b]) => parseInt(b) - parseInt(a))
  
  return titles[0]?.[1] || "Novato"
}

// Atualizar streak
export function updateStreak(profile: UserProfile): UserProfile {
  const today = getToday()
  
  if (!profile.lastStudyDate) {
    return {
      ...profile,
      streak: 1,
      lastStudyDate: today,
    }
  }
  
  const daysDiff = daysBetween(profile.lastStudyDate, today)
  
  if (daysDiff === 0) {
    // Mesmo dia, não muda streak
    return profile
  } else if (daysDiff === 1) {
    // Dia consecutivo, incrementa streak
    const newStreak = profile.streak + 1
    return {
      ...profile,
      streak: newStreak,
      bestStreak: Math.max(profile.bestStreak, newStreak),
      lastStudyDate: today,
    }
  } else {
    // Quebrou o streak
    return {
      ...profile,
      streak: 1,
      lastStudyDate: today,
    }
  }
}

// Calcular XP ganho
export function calculateXPGain(
  usedHint: boolean,
  usedSolution: boolean,
  streak: number
): XPGain {
  const base = XP_CONFIG.perExercise
  const bonusNoHint = usedHint ? 0 : XP_CONFIG.bonusNoHint
  const bonusNoSolution = usedSolution ? 0 : XP_CONFIG.bonusNoSolution
  
  const streakMultiplier = Math.min(
    1 + streak * XP_CONFIG.streakMultiplier,
    XP_CONFIG.maxStreakBonus
  )
  
  const subtotal = base + bonusNoHint + bonusNoSolution
  const total = Math.round(subtotal * streakMultiplier)
  
  return {
    base,
    bonusNoHint,
    bonusNoSolution,
    streakMultiplier,
    total,
  }
}

// Verificar conquistas desbloqueadas
export function checkAchievements(profile: UserProfile): Achievement[] {
  const newlyUnlocked: Achievement[] = []
  
  for (const achievement of ACHIEVEMENTS) {
    if (profile.achievements.includes(achievement.id)) continue
    
    let unlocked = false
    
    switch (achievement.id) {
      // Progresso
      case "first_exercise":
        unlocked = profile.totalExercises >= 1
        break
      case "exercises_5":
        unlocked = profile.totalExercises >= 5
        break
      case "exercises_10":
        unlocked = profile.totalExercises >= 10
        break
      case "exercises_25":
        unlocked = profile.totalExercises >= 25
        break
      case "exercises_50":
        unlocked = profile.totalExercises >= 50
        break
      case "exercises_100":
        unlocked = profile.totalExercises >= 100
        break
        
      // Streak
      case "streak_3":
        unlocked = profile.streak >= 3
        break
      case "streak_7":
        unlocked = profile.streak >= 7
        break
      case "streak_14":
        unlocked = profile.streak >= 14
        break
      case "streak_30":
        unlocked = profile.streak >= 30
        break
        
      // Skill
      case "no_hint_5":
        unlocked = profile.exercisesWithoutHint >= 5
        break
      case "no_hint_20":
        unlocked = profile.exercisesWithoutHint >= 20
        break
      case "no_solution_5":
        unlocked = profile.exercisesWithoutSolution >= 5
        break
      case "no_solution_20":
        unlocked = profile.exercisesWithoutSolution >= 20
        break
        
      // Special
      case "level_10":
        unlocked = profile.level >= 10
        break
      case "level_25":
        unlocked = profile.level >= 25
        break
      case "level_50":
        unlocked = profile.level >= 50
        break
      case "xp_1000":
        unlocked = profile.xp >= 1000
        break
      case "xp_10000":
        unlocked = profile.xp >= 10000
        break
    }
    
    if (unlocked) {
      newlyUnlocked.push({
        ...achievement,
        unlockedAt: new Date(),
      })
    }
  }
  
  return newlyUnlocked
}

// Premiar exercício completado
export function awardExerciseCompletion(
  profile: UserProfile,
  usedHint: boolean,
  usedSolution: boolean
): {
  profile: UserProfile
  xpGain: XPGain
  newAchievements: Achievement[]
  leveledUp: boolean
  previousLevel: number
} {
  // Atualizar streak primeiro
  let updatedProfile = updateStreak(profile)
  
  // Calcular XP
  const xpGain = calculateXPGain(usedHint, usedSolution, updatedProfile.streak)
  
  // Atualizar stats
  const previousLevel = updatedProfile.level
  const newXP = updatedProfile.xp + xpGain.total
  const newLevel = calculateLevel(newXP)
  
  updatedProfile = {
    ...updatedProfile,
    xp: newXP,
    level: newLevel,
    totalExercises: updatedProfile.totalExercises + 1,
    exercisesWithoutHint: usedHint 
      ? updatedProfile.exercisesWithoutHint 
      : updatedProfile.exercisesWithoutHint + 1,
    exercisesWithoutSolution: usedSolution 
      ? updatedProfile.exercisesWithoutSolution 
      : updatedProfile.exercisesWithoutSolution + 1,
  }
  
  // Verificar conquistas
  const newAchievements = checkAchievements(updatedProfile)
  
  // Adicionar IDs das conquistas ao perfil
  if (newAchievements.length > 0) {
    updatedProfile = {
      ...updatedProfile,
      achievements: [
        ...updatedProfile.achievements,
        ...newAchievements.map((a) => a.id),
      ],
    }
  }
  
  // Salvar perfil
  saveUserProfile(updatedProfile)
  
  return {
    profile: updatedProfile,
    xpGain,
    newAchievements,
    leveledUp: newLevel > previousLevel,
    previousLevel,
  }
}

// Obter conquistas do usuário (com dados completos)
export function getUserAchievements(profile: UserProfile): Achievement[] {
  return ACHIEVEMENTS.filter((a) => profile.achievements.includes(a.id))
}

// Obter conquistas bloqueadas
export function getLockedAchievements(profile: UserProfile): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !profile.achievements.includes(a.id))
}

// Gerar dados de ranking (simulado)
export function generateLeaderboard(): UserProfile[] {
  const names = [
    "Pisciner_42", "CodeMaster", "CWizard", "PointerKing", 
    "MallocMaster", "SegFaultHero", "NormGuru", "42Champion",
    "BitShifter", "StackOverflow", "HeapKing", "RecursionPro"
  ]
  
  return names.map((name, index) => ({
    id: `bot_${index}`,
    username: name,
    xp: Math.floor(Math.random() * 20000) + 1000,
    level: Math.floor(Math.random() * 40) + 5,
    streak: Math.floor(Math.random() * 30),
    bestStreak: Math.floor(Math.random() * 60),
    totalExercises: Math.floor(Math.random() * 100) + 10,
    exercisesWithoutHint: Math.floor(Math.random() * 50),
    exercisesWithoutSolution: Math.floor(Math.random() * 30),
    achievements: [],
    lastStudyDate: null,
    createdAt: new Date().toISOString(),
  })).sort((a, b) => b.xp - a.xp)
}
