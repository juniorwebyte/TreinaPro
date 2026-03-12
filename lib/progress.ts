// ============================================================================
// Sistema de Dashboard de Progresso
// ============================================================================
// Gerenciamento de histórico de estudo, estatísticas por tópico,
// heatmap de atividade e previsão de progresso
// ============================================================================

export interface StudyDay {
  date: string // YYYY-MM-DD
  exercisesCompleted: number
  minutesStudied: number
  xpEarned: number
  topicsStudied: string[]
}

export interface TopicProgress {
  id: string
  name: string
  color: string
  totalExercises: number
  completedExercises: number
  correctAnswers: number
  incorrectAnswers: number
  averageTime: number // em minutos
  lastStudied?: number // timestamp
}

export interface WeeklyStats {
  week: string // YYYY-WXX
  exercisesCompleted: number
  minutesStudied: number
  xpEarned: number
  averageAccuracy: number
}

export interface ProgressStats {
  studyHistory: StudyDay[]
  topicProgress: TopicProgress[]
  weeklyStats: WeeklyStats[]
  totalStudyTime: number // em minutos
  totalExercises: number
  averageAccuracy: number
  currentStreak: number
  bestStreak: number
  estimatedReadyDate?: string // Data estimada para estar pronto para o exame
  overallProgress: number // Porcentagem de conclusão geral (0-100)
}

// Topics do Exam02
export const EXAM_TOPICS: Omit<TopicProgress, "completedExercises" | "correctAnswers" | "incorrectAnswers" | "averageTime" | "lastStudied">[] = [
  { id: "strings", name: "Strings", color: "#3b82f6", totalExercises: 15 },
  { id: "pointers", name: "Ponteiros", color: "#8b5cf6", totalExercises: 12 },
  { id: "loops", name: "Loops", color: "#10b981", totalExercises: 10 },
  { id: "functions", name: "Funções", color: "#f59e0b", totalExercises: 14 },
  { id: "memory", name: "Memória", color: "#ef4444", totalExercises: 8 },
  { id: "norminette", name: "Norminette", color: "#06b6d4", totalExercises: 6 },
  { id: "recursion", name: "Recursão", color: "#ec4899", totalExercises: 7 },
  { id: "bitwise", name: "Bitwise", color: "#84cc16", totalExercises: 5 },
]

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEY = "ft_exam_progress"
const HISTORY_KEY = "ft_exam_study_history"

// ============================================================================
// Funções Auxiliares
// ============================================================================

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

function getWeekNumber(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getFullYear()}-W${weekNo.toString().padStart(2, "0")}`
}

function generateLast365Days(): string[] {
  const days: string[] = []
  const today = new Date()
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    days.push(date.toISOString().split("T")[0])
  }
  
  return days
}

// ============================================================================
// Carregar e Salvar Dados
// ============================================================================

export function loadProgressStats(): ProgressStats {
  if (typeof window === "undefined") {
    return getDefaultProgressStats()
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Erro ao carregar progresso:", e)
  }
  
  return getDefaultProgressStats()
}

export function saveProgressStats(stats: ProgressStats): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch (e) {
    console.error("Erro ao salvar progresso:", e)
  }
}

function getDefaultProgressStats(): ProgressStats {
  // Gerar dados de demonstração
  const studyHistory = generateDemoStudyHistory()
  const topicProgress = generateDemoTopicProgress()
  const weeklyStats = calculateWeeklyStats(studyHistory)
  
  const totalStudyTime = studyHistory.reduce((sum, day) => sum + day.minutesStudied, 0)
  const totalExercises = studyHistory.reduce((sum, day) => sum + day.exercisesCompleted, 0)
  
  const totalCorrect = topicProgress.reduce((sum, t) => sum + t.correctAnswers, 0)
  const totalAttempts = topicProgress.reduce((sum, t) => sum + t.correctAnswers + t.incorrectAnswers, 0)
  const averageAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
  
  const totalCompleted = topicProgress.reduce((sum, t) => sum + t.completedExercises, 0)
  const totalAvailable = topicProgress.reduce((sum, t) => sum + t.totalExercises, 0)
  const overallProgress = totalAvailable > 0 ? Math.round((totalCompleted / totalAvailable) * 100) : 0
  
  return {
    studyHistory,
    topicProgress,
    weeklyStats,
    totalStudyTime,
    totalExercises,
    averageAccuracy,
    currentStreak: calculateCurrentStreak(studyHistory),
    bestStreak: calculateBestStreak(studyHistory),
    estimatedReadyDate: calculateEstimatedReadyDate(overallProgress, studyHistory),
    overallProgress,
  }
}

// ============================================================================
// Gerar Dados de Demonstração
// ============================================================================

function generateDemoStudyHistory(): StudyDay[] {
  const history: StudyDay[] = []
  const days = generateLast365Days()
  const topics = EXAM_TOPICS.map(t => t.id)
  
  // Simular padrão de estudo mais intenso nos últimos 2 meses
  days.forEach((date, index) => {
    const daysAgo = days.length - 1 - index
    const isRecent = daysAgo < 60
    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6
    
    // Probabilidade de estudar nesse dia
    let studyChance = 0.15 // 15% base
    if (isRecent) studyChance = 0.6 // 60% nos últimos 2 meses
    if (isWeekend && isRecent) studyChance = 0.8 // 80% nos fins de semana recentes
    
    if (Math.random() < studyChance) {
      const exercisesCompleted = Math.floor(Math.random() * 8) + 1
      const minutesStudied = exercisesCompleted * (15 + Math.floor(Math.random() * 15))
      const xpEarned = exercisesCompleted * (50 + Math.floor(Math.random() * 75))
      
      // Selecionar 1-3 tópicos aleatórios
      const numTopics = Math.floor(Math.random() * 3) + 1
      const shuffled = [...topics].sort(() => Math.random() - 0.5)
      const topicsStudied = shuffled.slice(0, numTopics)
      
      history.push({
        date,
        exercisesCompleted,
        minutesStudied,
        xpEarned,
        topicsStudied,
      })
    }
  })
  
  return history
}

function generateDemoTopicProgress(): TopicProgress[] {
  return EXAM_TOPICS.map(topic => {
    const completed = Math.floor(Math.random() * topic.totalExercises)
    const correct = Math.floor(completed * (0.6 + Math.random() * 0.35))
    const incorrect = Math.floor(Math.random() * (completed - correct + 3))
    
    return {
      ...topic,
      completedExercises: completed,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      averageTime: 8 + Math.floor(Math.random() * 12),
      lastStudied: completed > 0 ? Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 : undefined,
    }
  })
}

function calculateWeeklyStats(history: StudyDay[]): WeeklyStats[] {
  const weeklyMap = new Map<string, WeeklyStats>()
  
  history.forEach(day => {
    const week = getWeekNumber(new Date(day.date))
    const existing = weeklyMap.get(week)
    
    if (existing) {
      existing.exercisesCompleted += day.exercisesCompleted
      existing.minutesStudied += day.minutesStudied
      existing.xpEarned += day.xpEarned
    } else {
      weeklyMap.set(week, {
        week,
        exercisesCompleted: day.exercisesCompleted,
        minutesStudied: day.minutesStudied,
        xpEarned: day.xpEarned,
        averageAccuracy: 75 + Math.floor(Math.random() * 20),
      })
    }
  })
  
  return Array.from(weeklyMap.values())
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12) // Últimas 12 semanas
}

function calculateCurrentStreak(history: StudyDay[]): number {
  if (history.length === 0) return 0
  
  const sortedDays = [...history]
    .sort((a, b) => b.date.localeCompare(a.date))
  
  const today = getToday()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]
  
  // Verificar se estudou hoje ou ontem
  const lastStudyDay = sortedDays[0]?.date
  if (lastStudyDay !== today && lastStudyDay !== yesterdayStr) {
    return 0
  }
  
  let streak = 1
  let currentDate = new Date(lastStudyDay)
  
  for (let i = 1; i < sortedDays.length; i++) {
    currentDate.setDate(currentDate.getDate() - 1)
    const expectedDate = currentDate.toISOString().split("T")[0]
    
    if (sortedDays[i]?.date === expectedDate) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

function calculateBestStreak(history: StudyDay[]): number {
  if (history.length === 0) return 0
  
  const sortedDays = [...history]
    .map(d => d.date)
    .sort()
  
  let bestStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1])
    const currDate = new Date(sortedDays[i])
    
    prevDate.setDate(prevDate.getDate() + 1)
    
    if (prevDate.toISOString().split("T")[0] === sortedDays[i]) {
      currentStreak++
      bestStreak = Math.max(bestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  
  return bestStreak
}

function calculateEstimatedReadyDate(progress: number, history: StudyDay[]): string {
  if (progress >= 100) {
    return getToday()
  }
  
  // Calcular média de progresso por semana (baseado nos últimos 30 dias)
  const last30Days = history.filter(d => {
    const date = new Date(d.date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return date >= thirtyDaysAgo
  })
  
  if (last30Days.length === 0) {
    // Se não estudou nos últimos 30 dias, não dá para estimar
    return ""
  }
  
  // Estimar progresso semanal baseado na atividade recente
  const exercisesPerWeek = (last30Days.reduce((sum, d) => sum + d.exercisesCompleted, 0) / 30) * 7
  const progressPerWeek = exercisesPerWeek * 1.3 // ~1.3% por exercício
  
  const remainingProgress = 100 - progress
  const weeksNeeded = Math.ceil(remainingProgress / progressPerWeek)
  
  const readyDate = new Date()
  readyDate.setDate(readyDate.getDate() + weeksNeeded * 7)
  
  return readyDate.toISOString().split("T")[0]
}

// ============================================================================
// Funções de Atualização
// ============================================================================

export function recordStudySession(
  stats: ProgressStats,
  topicId: string,
  exercisesCompleted: number,
  minutesStudied: number,
  xpEarned: number,
  correct: number,
  incorrect: number
): ProgressStats {
  const today = getToday()
  
  // Atualizar histórico diário
  const existingDay = stats.studyHistory.find(d => d.date === today)
  
  let newHistory: StudyDay[]
  if (existingDay) {
    newHistory = stats.studyHistory.map(d => {
      if (d.date === today) {
        return {
          ...d,
          exercisesCompleted: d.exercisesCompleted + exercisesCompleted,
          minutesStudied: d.minutesStudied + minutesStudied,
          xpEarned: d.xpEarned + xpEarned,
          topicsStudied: [...new Set([...d.topicsStudied, topicId])],
        }
      }
      return d
    })
  } else {
    newHistory = [
      ...stats.studyHistory,
      {
        date: today,
        exercisesCompleted,
        minutesStudied,
        xpEarned,
        topicsStudied: [topicId],
      },
    ]
  }
  
  // Atualizar progresso do tópico
  const newTopicProgress = stats.topicProgress.map(t => {
    if (t.id === topicId) {
      return {
        ...t,
        completedExercises: Math.min(t.completedExercises + exercisesCompleted, t.totalExercises),
        correctAnswers: t.correctAnswers + correct,
        incorrectAnswers: t.incorrectAnswers + incorrect,
        lastStudied: Date.now(),
      }
    }
    return t
  })
  
  // Recalcular estatísticas
  const newWeeklyStats = calculateWeeklyStats(newHistory)
  const totalStudyTime = newHistory.reduce((sum, d) => sum + d.minutesStudied, 0)
  const totalExercises = newHistory.reduce((sum, d) => sum + d.exercisesCompleted, 0)
  
  const totalCorrect = newTopicProgress.reduce((sum, t) => sum + t.correctAnswers, 0)
  const totalAttempts = newTopicProgress.reduce((sum, t) => sum + t.correctAnswers + t.incorrectAnswers, 0)
  const averageAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
  
  const totalCompleted = newTopicProgress.reduce((sum, t) => sum + t.completedExercises, 0)
  const totalAvailable = newTopicProgress.reduce((sum, t) => sum + t.totalExercises, 0)
  const overallProgress = totalAvailable > 0 ? Math.round((totalCompleted / totalAvailable) * 100) : 0
  
  const updatedStats: ProgressStats = {
    studyHistory: newHistory,
    topicProgress: newTopicProgress,
    weeklyStats: newWeeklyStats,
    totalStudyTime,
    totalExercises,
    averageAccuracy,
    currentStreak: calculateCurrentStreak(newHistory),
    bestStreak: Math.max(stats.bestStreak, calculateCurrentStreak(newHistory)),
    estimatedReadyDate: calculateEstimatedReadyDate(overallProgress, newHistory),
    overallProgress,
  }
  
  saveProgressStats(updatedStats)
  return updatedStats
}

// ============================================================================
// Funções de Visualização
// ============================================================================

export interface HeatmapData {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export function getHeatmapData(history: StudyDay[]): HeatmapData[] {
  const days = generateLast365Days()
  const historyMap = new Map(history.map(d => [d.date, d.exercisesCompleted]))
  
  return days.map(date => {
    const count = historyMap.get(date) || 0
    let level: 0 | 1 | 2 | 3 | 4 = 0
    
    if (count > 0 && count <= 2) level = 1
    else if (count <= 4) level = 2
    else if (count <= 6) level = 3
    else if (count > 6) level = 4
    
    return { date, count, level }
  })
}

export interface ChartDataPoint {
  name: string
  value: number
  exercises?: number
  minutes?: number
  xp?: number
}

export function getWeeklyChartData(stats: WeeklyStats[]): ChartDataPoint[] {
  return stats.slice(-8).map(week => ({
    name: week.week.split("-W")[1] ? `Sem ${week.week.split("-W")[1]}` : week.week,
    value: week.exercisesCompleted,
    exercises: week.exercisesCompleted,
    minutes: week.minutesStudied,
    xp: week.xpEarned,
  }))
}

export function getTopicChartData(topics: TopicProgress[]): ChartDataPoint[] {
  return topics.map(topic => ({
    name: topic.name,
    value: topic.totalExercises > 0 
      ? Math.round((topic.completedExercises / topic.totalExercises) * 100) 
      : 0,
  }))
}

export function formatMinutesToReadable(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}min`
}

export function getDaysUntilReady(estimatedDate: string): number {
  if (!estimatedDate) return -1
  
  const today = new Date()
  const ready = new Date(estimatedDate)
  const diffTime = ready.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}
