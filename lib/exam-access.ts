// Sistema de controle de acesso para Guia Exam02
// Credenciais de admin (apenas o admin conhece)
const ADMIN_USERNAME = "webytebr"
const ADMIN_PASSWORD = "153614"

// Constantes
const MAX_ATTEMPTS = 3
const LOCKOUT_TIME_MS = 5 * 60 * 1000 // 5 minutos em milissegundos
const STORAGE_KEY = "exam02_access"

export interface ExamAccessState {
  hasAccess: boolean
  attempts: number
  lockoutUntil: number | null
  lastAttemptTime: number | null
}

// Perguntas de exame de linguagem C
export interface ExamQuestion {
  id: string
  question: string
  code?: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export const examQuestions: ExamQuestion[] = [
  {
    id: "q1",
    question: "Qual e o resultado da expressao '5' - '0' em C?",
    options: ["53", "5", "0", "Erro de compilacao"],
    correctAnswer: 1,
    explanation: "Em C, caracteres sao representados por seus valores ASCII. '5' tem valor ASCII 53 e '0' tem valor ASCII 48. 53 - 48 = 5."
  },
  {
    id: "q2",
    question: "O que acontece quando voce acessa um array fora dos limites em C?",
    code: `int arr[3] = {1, 2, 3};
printf("%d", arr[5]);`,
    options: [
      "O programa imprime 0",
      "Erro de compilacao",
      "Comportamento indefinido",
      "O programa imprime NULL"
    ],
    correctAnswer: 2,
    explanation: "Acessar memoria fora dos limites do array e comportamento indefinido em C. Pode causar crash, lixo ou parecer funcionar."
  },
  {
    id: "q3",
    question: "Qual e a diferenca entre '\\0' e NULL em C?",
    options: [
      "Sao exatamente a mesma coisa",
      "'\\0' e o caractere nulo (fim de string), NULL e um ponteiro nulo",
      "NULL e o caractere nulo, '\\0' e um ponteiro nulo",
      "Ambos representam o numero zero"
    ],
    correctAnswer: 1,
    explanation: "'\\0' (valor 0) e o caractere que marca o fim de uma string. NULL e um ponteiro que nao aponta para nenhum endereco de memoria valido."
  },
  {
    id: "q4",
    question: "Qual funcao e usada para alocar memoria dinamicamente em C?",
    options: ["alloc()", "new()", "malloc()", "create()"],
    correctAnswer: 2,
    explanation: "malloc() (memory allocation) e a funcao padrao da stdlib.h para alocar memoria dinamicamente no heap."
  },
  {
    id: "q5",
    question: "O que este codigo imprime?",
    code: `char *str = "Hello";
printf("%c", *(str + 1));`,
    options: ["H", "e", "Hello", "Erro"],
    correctAnswer: 1,
    explanation: "str aponta para 'H'. str + 1 aponta para 'e'. *(str + 1) desreferencia esse ponteiro, retornando 'e'."
  }
]

// Funcoes utilitarias
export function getAccessState(): ExamAccessState {
  if (typeof window === "undefined") {
    return { hasAccess: false, attempts: 0, lockoutUntil: null, lastAttemptTime: null }
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  
  return { hasAccess: false, attempts: 0, lockoutUntil: null, lastAttemptTime: null }
}

export function setAccessState(state: ExamAccessState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function isLockedOut(): { locked: boolean; remainingTime: number } {
  const state = getAccessState()
  
  if (!state.lockoutUntil) {
    return { locked: false, remainingTime: 0 }
  }
  
  const now = Date.now()
  if (now >= state.lockoutUntil) {
    // Lockout expirou, resetar tentativas
    setAccessState({ ...state, lockoutUntil: null, attempts: 0 })
    return { locked: false, remainingTime: 0 }
  }
  
  return { locked: true, remainingTime: state.lockoutUntil - now }
}

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function grantAccess(): void {
  setAccessState({ hasAccess: true, attempts: 0, lockoutUntil: null, lastAttemptTime: null })
}

export function recordFailedAttempt(): { locked: boolean; attemptsLeft: number } {
  const state = getAccessState()
  const newAttempts = state.attempts + 1
  
  if (newAttempts >= MAX_ATTEMPTS) {
    // Bloquear por 5 minutos
    setAccessState({
      ...state,
      attempts: newAttempts,
      lockoutUntil: Date.now() + LOCKOUT_TIME_MS,
      lastAttemptTime: Date.now()
    })
    return { locked: true, attemptsLeft: 0 }
  }
  
  setAccessState({
    ...state,
    attempts: newAttempts,
    lastAttemptTime: Date.now()
  })
  
  return { locked: false, attemptsLeft: MAX_ATTEMPTS - newAttempts }
}

export function resetAccess(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function revokeAccess(): void {
  setAccessState({ hasAccess: false, attempts: 0, lockoutUntil: null, lastAttemptTime: null })
}

export function getMaxAttempts(): number {
  return MAX_ATTEMPTS
}

export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
