"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getCachedExercises,
  getCachedFlashcards,
  cacheExercises,
  cacheFlashcards,
  addPendingSync,
  getPendingSync,
  syncPendingData,
  type CachedExercise,
  type CachedFlashcard,
  type PendingSync,
} from "@/lib/offline"

interface UseOfflineReturn {
  isOnline: boolean
  cachedExercises: CachedExercise[]
  cachedFlashcards: CachedFlashcard[]
  pendingSync: PendingSync[]
  isLoading: boolean
  cacheExercise: (exercise: CachedExercise) => Promise<void>
  cacheFlashcard: (flashcard: CachedFlashcard) => Promise<void>
  addToSync: (type: PendingSync["type"], data: Record<string, unknown>) => Promise<void>
  syncNow: () => Promise<{ synced: number; failed: number }>
  refreshCache: () => Promise<void>
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(true)
  const [cachedExercises, setCachedExercises] = useState<CachedExercise[]>([])
  const [cachedFlashcards, setCachedFlashcards] = useState<CachedFlashcard[]>([])
  const [pendingSync, setPendingSync] = useState<PendingSync[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Monitorar status online/offline
  useEffect(() => {
    if (typeof window === "undefined") return
    
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-sync quando volta online
      syncPendingData().then(result => {
        if (result.synced > 0) {
          refreshPendingSync()
        }
      })
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }
    
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])
  
  // Carregar dados cacheados
  useEffect(() => {
    loadCachedData()
  }, [])
  
  async function loadCachedData() {
    setIsLoading(true)
    try {
      const [exercises, flashcards, pending] = await Promise.all([
        getCachedExercises(),
        getCachedFlashcards(),
        getPendingSync(),
      ])
      
      setCachedExercises(exercises)
      setCachedFlashcards(flashcards)
      setPendingSync(pending)
    } catch (error) {
      console.error("Erro ao carregar dados offline:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  async function refreshPendingSync() {
    try {
      const pending = await getPendingSync()
      setPendingSync(pending)
    } catch (error) {
      console.error("Erro ao atualizar sync pendente:", error)
    }
  }
  
  const cacheExercise = useCallback(async (exercise: CachedExercise) => {
    await cacheExercises([exercise])
    setCachedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id)
      if (exists) {
        return prev.map(e => e.id === exercise.id ? exercise : e)
      }
      return [...prev, exercise]
    })
  }, [])
  
  const cacheFlashcard = useCallback(async (flashcard: CachedFlashcard) => {
    await cacheFlashcards([flashcard])
    setCachedFlashcards(prev => {
      const exists = prev.find(f => f.id === flashcard.id)
      if (exists) {
        return prev.map(f => f.id === flashcard.id ? flashcard : f)
      }
      return [...prev, flashcard]
    })
  }, [])
  
  const addToSync = useCallback(async (
    type: PendingSync["type"],
    data: Record<string, unknown>
  ) => {
    await addPendingSync(type, data)
    await refreshPendingSync()
  }, [])
  
  const syncNow = useCallback(async () => {
    const result = await syncPendingData()
    await refreshPendingSync()
    return result
  }, [])
  
  const refreshCache = useCallback(async () => {
    await loadCachedData()
  }, [])
  
  return {
    isOnline,
    cachedExercises,
    cachedFlashcards,
    pendingSync,
    isLoading,
    cacheExercise,
    cacheFlashcard,
    addToSync,
    syncNow,
    refreshCache,
  }
}

// Hook simplificado apenas para status online
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    if (typeof window === "undefined") return
    
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])
  
  return isOnline
}
