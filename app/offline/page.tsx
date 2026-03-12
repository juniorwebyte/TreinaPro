"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  WifiOff,
  RefreshCcw,
  Home,
  BookOpen,
  Wallet,
  Clock,
  Database,
} from "lucide-react"
import Link from "next/link"
import { 
  getCachedExercises, 
  getCachedFlashcards,
  getStorageEstimate,
  type CachedExercise,
  type CachedFlashcard,
} from "@/lib/offline"

export default function OfflinePage() {
  const [cachedExercises, setCachedExercises] = useState<CachedExercise[]>([])
  const [cachedFlashcards, setCachedFlashcards] = useState<CachedFlashcard[]>([])
  const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null)
  const [isOnline, setIsOnline] = useState(false)
  
  useEffect(() => {
    // Verificar status online
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    
    // Carregar dados cacheados
    loadCachedData()
    
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])
  
  async function loadCachedData() {
    try {
      const exercises = await getCachedExercises()
      const flashcards = await getCachedFlashcards()
      const storage = await getStorageEstimate()
      
      setCachedExercises(exercises)
      setCachedFlashcards(flashcards)
      setStorageInfo(storage)
    } catch (error) {
      console.error("Erro ao carregar dados cacheados:", error)
    }
  }
  
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
  
  const handleRetry = () => {
    window.location.reload()
  }
  
  // Se voltou online, mostrar opção de voltar
  if (isOnline) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-500/10">
              <RefreshCcw className="size-10 text-emerald-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Voce esta online!</h1>
            <p className="mb-6 text-muted-foreground">
              Sua conexao foi restaurada.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/">
                <Button className="w-full gap-2">
                  <Home className="size-4" />
                  Voltar ao Inicio
                </Button>
              </Link>
              <Link href="/treinar">
                <Button variant="outline" className="w-full gap-2">
                  <BookOpen className="size-4" />
                  Continuar Treinando
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-amber-500/10">
            <WifiOff className="size-10 text-amber-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Voce esta offline</h1>
          <p className="text-muted-foreground">
            Sem conexao com a internet, mas voce ainda pode estudar!
          </p>
        </div>
        
        {/* Actions */}
        <div className="mb-8 flex justify-center gap-3">
          <Button onClick={handleRetry} variant="outline" className="gap-2">
            <RefreshCcw className="size-4" />
            Tentar Novamente
          </Button>
          <Link href="/">
            <Button className="gap-2">
              <Home className="size-4" />
              Inicio
            </Button>
          </Link>
        </div>
        
        {/* Cached Content */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Conteudo Disponivel Offline</h2>
          
          {/* Exercícios */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-5 text-primary" />
                Exercicios Cacheados
              </CardTitle>
              <CardDescription>
                {cachedExercises.length > 0 
                  ? `${cachedExercises.length} exercicios disponiveis`
                  : "Nenhum exercicio em cache"
                }
              </CardDescription>
            </CardHeader>
            {cachedExercises.length > 0 && (
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(cachedExercises.map(e => e.level))).map(level => (
                    <Badge key={level} variant="secondary">
                      Nivel {level}: {cachedExercises.filter(e => e.level === level).length}
                    </Badge>
                  ))}
                </div>
                <Link href="/treinar" className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    Praticar Offline
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>
          
          {/* Flashcards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="size-5 text-primary" />
                Flashcards Cacheados
              </CardTitle>
              <CardDescription>
                {cachedFlashcards.length > 0 
                  ? `${cachedFlashcards.length} cards disponiveis`
                  : "Nenhum flashcard em cache"
                }
              </CardDescription>
            </CardHeader>
            {cachedFlashcards.length > 0 && (
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(cachedFlashcards.map(f => f.deckId))).map(deckId => (
                    <Badge key={deckId} variant="secondary">
                      {deckId}: {cachedFlashcards.filter(f => f.deckId === deckId).length}
                    </Badge>
                  ))}
                </div>
                <Link href="/flashcards" className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    Revisar Flashcards
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>
          
          {/* Storage Info */}
          {storageInfo && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="size-5 text-muted-foreground" />
                  Armazenamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usado</span>
                  <span>{formatBytes(storageInfo.usage)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ 
                      width: `${Math.min((storageInfo.usage / storageInfo.quota) * 100, 100)}%` 
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatBytes(storageInfo.quota - storageInfo.usage)} disponiveis
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Tips */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-amber-500">
                <Clock className="size-5" />
                Dicas para Modo Offline
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="list-inside list-disc space-y-1">
                <li>Acesse paginas enquanto online para cachea-las</li>
                <li>Seu progresso sera sincronizado quando voltar online</li>
                <li>Flashcards e exercicios cacheados funcionam normalmente</li>
                <li>O dashboard mostra dados salvos localmente</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
