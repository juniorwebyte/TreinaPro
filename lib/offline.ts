// ============================================================================
// Sistema de Armazenamento Offline
// ============================================================================
// Gerencia cache local, sincronização e persistência de dados offline
// ============================================================================

export interface OfflineData {
  exercises: CachedExercise[]
  flashcards: CachedFlashcard[]
  progress: CachedProgress
  lastSync: number
}

export interface CachedExercise {
  id: string
  name: string
  level: number
  subject: string
  description: string
  hints: string[]
  solution: string
  cachedAt: number
}

export interface CachedFlashcard {
  id: string
  deckId: string
  front: string
  back: string
  code?: string
  cachedAt: number
}

export interface CachedProgress {
  completedExercises: string[]
  flashcardProgress: Record<string, { easeFactor: number; interval: number; nextReview: number }>
  studyHistory: Array<{ date: string; exercises: number; minutes: number }>
  cachedAt: number
}

export interface PendingSync {
  id: string
  type: "exercise_complete" | "flashcard_review" | "progress_update"
  data: Record<string, unknown>
  createdAt: number
  attempts: number
}

// ============================================================================
// Storage Keys
// ============================================================================

const OFFLINE_DATA_KEY = "ft_exam_offline_data"
const PENDING_SYNC_KEY = "ft_exam_pending_sync"
const CACHE_VERSION_KEY = "ft_exam_cache_version"

const CURRENT_CACHE_VERSION = 1

// ============================================================================
// IndexedDB para armazenamento maior
// ============================================================================

const DB_NAME = "treino_pro_offline"
const DB_VERSION = 1

interface TreinoProDB {
  exercises: CachedExercise
  flashcards: CachedFlashcard
  pendingSync: PendingSync
}

let db: IDBDatabase | null = null

export async function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => {
      console.error("Erro ao abrir IndexedDB:", request.error)
      reject(request.error)
    }
    
    request.onsuccess = () => {
      db = request.result
      console.log("IndexedDB inicializado")
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      
      // Store para exercícios
      if (!database.objectStoreNames.contains("exercises")) {
        const exercisesStore = database.createObjectStore("exercises", { keyPath: "id" })
        exercisesStore.createIndex("level", "level", { unique: false })
        exercisesStore.createIndex("subject", "subject", { unique: false })
      }
      
      // Store para flashcards
      if (!database.objectStoreNames.contains("flashcards")) {
        const flashcardsStore = database.createObjectStore("flashcards", { keyPath: "id" })
        flashcardsStore.createIndex("deckId", "deckId", { unique: false })
      }
      
      // Store para sincronização pendente
      if (!database.objectStoreNames.contains("pendingSync")) {
        database.createObjectStore("pendingSync", { keyPath: "id" })
      }
      
      console.log("IndexedDB atualizado para versão", DB_VERSION)
    }
  })
}

// ============================================================================
// Funções de Cache de Exercícios
// ============================================================================

export async function cacheExercises(exercises: CachedExercise[]): Promise<void> {
  const database = await initOfflineDB()
  const transaction = database.transaction(["exercises"], "readwrite")
  const store = transaction.objectStore("exercises")
  
  exercises.forEach(exercise => {
    store.put({ ...exercise, cachedAt: Date.now() })
  })
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getCachedExercises(): Promise<CachedExercise[]> {
  const database = await initOfflineDB()
  const transaction = database.transaction(["exercises"], "readonly")
  const store = transaction.objectStore("exercises")
  const request = store.getAll()
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getCachedExercisesByLevel(level: number): Promise<CachedExercise[]> {
  const database = await initOfflineDB()
  const transaction = database.transaction(["exercises"], "readonly")
  const store = transaction.objectStore("exercises")
  const index = store.index("level")
  const request = index.getAll(level)
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// Funções de Cache de Flashcards
// ============================================================================

export async function cacheFlashcards(flashcards: CachedFlashcard[]): Promise<void> {
  const database = await initOfflineDB()
  const transaction = database.transaction(["flashcards"], "readwrite")
  const store = transaction.objectStore("flashcards")
  
  flashcards.forEach(card => {
    store.put({ ...card, cachedAt: Date.now() })
  })
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getCachedFlashcards(): Promise<CachedFlashcard[]> {
  const database = await initOfflineDB()
  const transaction = database.transaction(["flashcards"], "readonly")
  const store = transaction.objectStore("flashcards")
  const request = store.getAll()
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getCachedFlashcardsByDeck(deckId: string): Promise<CachedFlashcard[]> {
  const database = await initOfflineDB()
  const transaction = database.transaction(["flashcards"], "readonly")
  const store = transaction.objectStore("flashcards")
  const index = store.index("deckId")
  const request = index.getAll(deckId)
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// Sincronização Pendente
// ============================================================================

export async function addPendingSync(
  type: PendingSync["type"],
  data: Record<string, unknown>
): Promise<void> {
  const database = await initOfflineDB()
  const transaction = database.transaction(["pendingSync"], "readwrite")
  const store = transaction.objectStore("pendingSync")
  
  const pendingItem: PendingSync = {
    id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    createdAt: Date.now(),
    attempts: 0,
  }
  
  store.add(pendingItem)
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getPendingSync(): Promise<PendingSync[]> {
  const database = await initOfflineDB()
  const transaction = database.transaction(["pendingSync"], "readonly")
  const store = transaction.objectStore("pendingSync")
  const request = store.getAll()
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function removePendingSync(id: string): Promise<void> {
  const database = await initOfflineDB()
  const transaction = database.transaction(["pendingSync"], "readwrite")
  const store = transaction.objectStore("pendingSync")
  store.delete(id)
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function clearAllPendingSync(): Promise<void> {
  const database = await initOfflineDB()
  const transaction = database.transaction(["pendingSync"], "readwrite")
  const store = transaction.objectStore("pendingSync")
  store.clear()
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// ============================================================================
// Sincronização quando volta online
// ============================================================================

export async function syncPendingData(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingSync()
  let synced = 0
  let failed = 0
  
  for (const item of pending) {
    try {
      // Aqui seria a lógica de sincronização com backend
      // Por enquanto, apenas simulamos sucesso
      console.log("Sincronizando:", item.type, item.data)
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Remover item sincronizado
      await removePendingSync(item.id)
      synced++
    } catch (error) {
      console.error("Erro ao sincronizar:", error)
      failed++
    }
  }
  
  console.log(`Sincronização: ${synced} sucesso, ${failed} falhas`)
  return { synced, failed }
}

// ============================================================================
// LocalStorage Fallback (para browsers sem IndexedDB)
// ============================================================================

export function saveOfflineProgress(data: CachedProgress): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_VERSION_KEY, String(CURRENT_CACHE_VERSION))
  } catch (e) {
    console.error("Erro ao salvar progresso offline:", e)
  }
}

export function loadOfflineProgress(): CachedProgress | null {
  if (typeof window === "undefined") return null
  
  try {
    const stored = localStorage.getItem(OFFLINE_DATA_KEY)
    const version = localStorage.getItem(CACHE_VERSION_KEY)
    
    if (stored && version === String(CURRENT_CACHE_VERSION)) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Erro ao carregar progresso offline:", e)
  }
  
  return null
}

// ============================================================================
// Verificação de Suporte Offline
// ============================================================================

export function isOfflineSupported(): boolean {
  if (typeof window === "undefined") return false
  
  return (
    "serviceWorker" in navigator &&
    "caches" in window &&
    "indexedDB" in window
  )
}

export function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (typeof navigator === "undefined" || !("storage" in navigator)) {
    return Promise.resolve(null)
  }
  
  return navigator.storage.estimate().then(estimate => ({
    usage: estimate.usage || 0,
    quota: estimate.quota || 0,
  }))
}

// ============================================================================
// Limpar Cache
// ============================================================================

export async function clearOfflineCache(): Promise<void> {
  // Limpar IndexedDB
  const database = await initOfflineDB()
  const exerciseTx = database.transaction(["exercises"], "readwrite")
  exerciseTx.objectStore("exercises").clear()
  
  const flashcardsTx = database.transaction(["flashcards"], "readwrite")
  flashcardsTx.objectStore("flashcards").clear()
  
  // Limpar localStorage
  localStorage.removeItem(OFFLINE_DATA_KEY)
  
  // Limpar caches do Service Worker
  if ("caches" in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))
  }
  
  console.log("Cache offline limpo")
}

// ============================================================================
// Auto-cache de conteúdo quando online
// ============================================================================

export async function preCacheContent(): Promise<void> {
  if (!navigator.onLine) {
    console.log("Offline, não pode pré-cachear")
    return
  }
  
  console.log("Iniciando pré-cache de conteúdo...")
  
  // Aqui seria a lógica para buscar e cachear dados do backend
  // Por enquanto, apenas loga
  
  // Notificar Service Worker para cachear URLs importantes
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_URLS",
      payload: [
        "/treinar",
        "/flashcards",
        "/dashboard",
        "/exam-simulator",
      ],
    })
  }
  
  console.log("Pré-cache concluído")
}
