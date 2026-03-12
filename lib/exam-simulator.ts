// ==================== SIMULADOR DE EXAME ====================
// Sistema de simulação do exam02 da 42

import { type Exercise, exercises } from "./exercises"

export interface ExamSession {
  id: string
  startTime: string
  endTime: string | null
  exerciseId: number
  exerciseTitle: string
  userCode: string
  status: "in-progress" | "submitted" | "timeout"
  score: number | null
  timeSpent: number // em segundos
}

export interface ExamResult {
  passed: boolean
  score: number // 0-100
  timeSpent: number // segundos
  feedback: string[]
  checksRan: { label: string; passed: boolean }[]
}

export interface ExamHistory {
  sessions: ExamSession[]
  totalAttempts: number
  passedAttempts: number
  averageScore: number
  bestScore: number
}

// Duracao do exame em segundos (3 horas)
export const EXAM_DURATION = 3 * 60 * 60 // 10800 segundos

// Storage key
const EXAM_STORAGE_KEY = "treino_pro_exam_history"

// Obter exercicios C validos para o exame (apenas dificuldade iniciante/intermediaria)
export function getExamExercises(): Exercise[] {
  return exercises.filter(
    (ex) => ex.language === "c" && (ex.difficulty === "iniciante" || ex.difficulty === "intermediario")
  )
}

// Sortear um exercicio aleatorio
export function getRandomExercise(): Exercise {
  const examExercises = getExamExercises()
  const randomIndex = Math.floor(Math.random() * examExercises.length)
  return examExercises[randomIndex]
}

// Criar nova sessao de exame
export function createExamSession(): ExamSession {
  const exercise = getRandomExercise()
  
  return {
    id: `exam_${Date.now()}`,
    startTime: new Date().toISOString(),
    endTime: null,
    exerciseId: exercise.id,
    exerciseTitle: exercise.title,
    userCode: "",
    status: "in-progress",
    score: null,
    timeSpent: 0,
  }
}

// Obter exercicio por ID
export function getExerciseById(id: number): Exercise | undefined {
  return exercises.find((ex) => ex.id === id)
}

// Validar solucao do exame
export function validateExamSolution(
  code: string,
  exercise: Exercise,
  timeSpent: number
): ExamResult {
  const checks: { label: string; passed: boolean }[] = []
  const feedback: string[] = []

  // Normalizar codigo para comparacao
  const trimmedCode = code.replace(/\s+/g, " ").trim()
  const trimmedSolution = exercise.solution.replace(/\s+/g, " ").trim()

  // Check 1: Funcao presente
  const hasFunction = code.includes(exercise.func)
  checks.push({
    label: `Funcao ${exercise.func} presente`,
    passed: hasFunction,
  })
  if (!hasFunction) {
    feedback.push(`A funcao "${exercise.func}" nao foi encontrada no seu codigo.`)
  }

  // Check 2: Padroes especificos
  if (exercise.checkPatterns) {
    exercise.checkPatterns.forEach((pattern) => {
      const regex = new RegExp(pattern)
      const passed = regex.test(code)
      checks.push({
        label: `Padrao "${pattern}" encontrado`,
        passed,
      })
      if (!passed) {
        feedback.push(`O padrao esperado "${pattern}" nao foi encontrado.`)
      }
    })
  }

  // Check 3: Return statement (se necessario)
  if (exercise.solution.includes("return")) {
    const hasReturn = code.includes("return")
    checks.push({
      label: "Return statement presente",
      passed: hasReturn,
    })
    if (!hasReturn) {
      feedback.push("Seu codigo deve ter um return statement.")
    }
  }

  // Check 4: Loop (se necessario)
  if (/while|for/.test(exercise.solution)) {
    const hasLoop = /while|for/.test(code)
    checks.push({
      label: "Loop (while/for) presente",
      passed: hasLoop,
    })
    if (!hasLoop) {
      feedback.push("Seu codigo provavelmente precisa de um loop (while ou for).")
    }
  }

  // Calcular score
  const passedCount = checks.filter((c) => c.passed).length
  const totalChecks = checks.length
  let score = Math.round((passedCount / totalChecks) * 100)

  // Bonus se identico a solucao
  if (trimmedCode === trimmedSolution) {
    score = 100
    feedback.push("Parabens! Seu codigo esta identico a solucao de referencia!")
  }

  // Penalidade por tempo (se demorou muito)
  const maxTime = EXAM_DURATION
  if (timeSpent > maxTime * 0.9) {
    score = Math.max(0, score - 10)
    feedback.push("Voce usou mais de 90% do tempo disponivel.")
  }

  const passed = score >= 70

  if (passed && feedback.length === 0) {
    feedback.push("Excelente trabalho! Voce passou no exame.")
  } else if (!passed) {
    feedback.push("Voce nao atingiu a pontuacao minima de 70%. Continue praticando!")
  }

  return {
    passed,
    score,
    timeSpent,
    feedback,
    checksRan: checks,
  }
}

// Carregar historico do localStorage
export function loadExamHistory(): ExamHistory {
  if (typeof window === "undefined") {
    return getDefaultHistory()
  }

  try {
    const stored = localStorage.getItem(EXAM_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Erro ao carregar historico:", e)
  }

  return getDefaultHistory()
}

function getDefaultHistory(): ExamHistory {
  return {
    sessions: [],
    totalAttempts: 0,
    passedAttempts: 0,
    averageScore: 0,
    bestScore: 0,
  }
}

// Salvar sessao de exame
export function saveExamSession(session: ExamSession): void {
  if (typeof window === "undefined") return

  try {
    const history = loadExamHistory()
    
    // Atualizar ou adicionar sessao
    const existingIndex = history.sessions.findIndex((s) => s.id === session.id)
    if (existingIndex >= 0) {
      history.sessions[existingIndex] = session
    } else {
      history.sessions.unshift(session)
    }

    // Recalcular estatisticas
    const completedSessions = history.sessions.filter((s) => s.score !== null)
    history.totalAttempts = completedSessions.length
    history.passedAttempts = completedSessions.filter((s) => (s.score ?? 0) >= 70).length
    history.averageScore = completedSessions.length > 0
      ? Math.round(completedSessions.reduce((acc, s) => acc + (s.score ?? 0), 0) / completedSessions.length)
      : 0
    history.bestScore = completedSessions.length > 0
      ? Math.max(...completedSessions.map((s) => s.score ?? 0))
      : 0

    // Limitar a 50 sessoes
    if (history.sessions.length > 50) {
      history.sessions = history.sessions.slice(0, 50)
    }

    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(history))
  } catch (e) {
    console.error("Erro ao salvar sessao:", e)
  }
}

// Formatar tempo (segundos para HH:MM:SS)
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

// Formatar data
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
