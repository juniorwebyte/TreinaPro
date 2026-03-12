"use client"

import { useState, useEffect, useCallback } from "react"
import {
  type FlashcardDeck,
  type Flashcard,
  type ResponseQuality,
  type FlashcardStats,
  loadFlashcardDecks,
  saveFlashcardDecks,
  loadFlashcardStats,
  saveFlashcardStats,
  calculateSM2,
  getCardsToReview,
  getDeckStats,
  updateCardInDecks,
} from "@/lib/flashcards"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Brain,
  ChevronRight,
  Flame,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Star,
  Type,
  Pointer,
  Repeat,
  HardDrive,
  FileCheck,
  Code2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Home,
} from "lucide-react"
import Link from "next/link"

// Mapeamento de ícones
const ICON_MAP: Record<string, React.ElementType> = {
  Type,
  Pointer,
  Repeat,
  Function: Code2,
  HardDrive,
  FileCheck,
}

// ============================================================================
// Componente FlashcardItem - Card com flip animation
// ============================================================================

interface FlashcardItemProps {
  card: Flashcard
  isFlipped: boolean
  onFlip: () => void
}

function FlashcardItem({ card, isFlipped, onFlip }: FlashcardItemProps) {
  return (
    <div 
      className="relative h-[400px] w-full cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div 
        className={cn(
          "absolute inset-0 transition-transform duration-500 transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden">
          <Card className="flex h-full flex-col border-2 border-primary/20 bg-gradient-to-br from-card to-secondary/30">
            <CardHeader className="text-center">
              <Badge variant="outline" className="mx-auto mb-2 w-fit">
                Pergunta
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center p-6">
              <p className="text-center text-xl font-medium leading-relaxed">
                {card.front}
              </p>
              <p className="mt-6 text-sm text-muted-foreground">
                Clique para ver a resposta
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <Card className="flex h-full flex-col border-2 border-success/20 bg-gradient-to-br from-card to-success/5">
            <CardHeader className="text-center">
              <Badge variant="outline" className="mx-auto mb-2 w-fit bg-success/10 text-success">
                Resposta
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 overflow-auto p-6">
              <p className="text-center text-lg leading-relaxed">
                {card.back}
              </p>
              {card.code && (
                <pre className="mt-4 w-full max-w-md overflow-x-auto rounded-lg bg-secondary/50 p-4 text-left font-mono text-xs">
                  <code>{card.code}</code>
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Componente RatingButtons - Botões de avaliação
// ============================================================================

interface RatingButtonsProps {
  onRate: (quality: ResponseQuality) => void
  disabled: boolean
}

function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
  const ratings: { quality: ResponseQuality; label: string; color: string; description: string }[] = [
    { quality: 0, label: "Errei", color: "bg-destructive hover:bg-destructive/90", description: "Não lembrei" },
    { quality: 1, label: "Difícil", color: "bg-orange-500 hover:bg-orange-600", description: "Vi e lembrei" },
    { quality: 3, label: "Bom", color: "bg-yellow-500 hover:bg-yellow-600", description: "Com esforço" },
    { quality: 4, label: "Fácil", color: "bg-emerald-500 hover:bg-emerald-600", description: "Sem hesitar" },
    { quality: 5, label: "Perfeito", color: "bg-primary hover:bg-primary/90", description: "Instantâneo" },
  ]
  
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {ratings.map(({ quality, label, color, description }) => (
        <Button
          key={quality}
          onClick={() => onRate(quality)}
          disabled={disabled}
          className={cn("flex flex-col gap-0.5 h-auto py-2 px-4 text-white", color)}
        >
          <span className="text-sm font-medium">{label}</span>
          <span className="text-[10px] opacity-80">{description}</span>
        </Button>
      ))}
    </div>
  )
}

// ============================================================================
// Componente DeckCard - Card de deck na listagem
// ============================================================================

interface DeckCardProps {
  deck: FlashcardDeck
  onSelect: () => void
}

function DeckCard({ deck, onSelect }: DeckCardProps) {
  const stats = getDeckStats(deck)
  const Icon = ICON_MAP[deck.icon] || Brain
  const progress = stats.total > 0 
    ? ((stats.mastered + stats.learning) / stats.total) * 100 
    : 0
  
  return (
    <Card 
      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div 
            className="flex size-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${deck.color}20` }}
          >
            <Icon className="size-5" style={{ color: deck.color }} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{deck.name}</CardTitle>
            <CardDescription className="text-xs">{deck.description}</CardDescription>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="size-3 text-blue-500" />
            {stats.new} novos
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3 text-yellow-500" />
            {stats.learning} aprendendo
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw className="size-3 text-orange-500" />
            {stats.review} revisar
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-3 text-green-500" />
            {stats.mastered} dominados
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Componente StudySession - Sessão de estudo
// ============================================================================

interface StudySessionProps {
  deck: FlashcardDeck
  cards: Flashcard[]
  onComplete: (updatedDeck: FlashcardDeck) => void
  onExit: () => void
}

function StudySession({ deck, cards, onComplete, onExit }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionCards, setSessionCards] = useState<Flashcard[]>(cards)
  const [correctCount, setCorrectCount] = useState(0)
  const [reviewedCount, setReviewedCount] = useState(0)
  
  const currentCard = sessionCards[currentIndex]
  const isComplete = currentIndex >= sessionCards.length
  
  const handleRate = useCallback((quality: ResponseQuality) => {
    if (!currentCard) return
    
    // Atualiza o card com SM-2
    const updatedCard = calculateSM2(currentCard, quality)
    
    // Atualiza a lista de cards da sessão
    const newSessionCards = [...sessionCards]
    newSessionCards[currentIndex] = updatedCard
    setSessionCards(newSessionCards)
    
    // Contadores
    setReviewedCount(prev => prev + 1)
    if (quality >= 3) {
      setCorrectCount(prev => prev + 1)
    }
    
    // Próximo card
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
    }, 200)
  }, [currentCard, currentIndex, sessionCards])
  
  const handleComplete = useCallback(() => {
    // Atualiza o deck com os cards revisados
    const updatedDeck: FlashcardDeck = {
      ...deck,
      cards: deck.cards.map(card => {
        const updated = sessionCards.find(sc => sc.id === card.id)
        return updated || card
      }),
    }
    onComplete(updatedDeck)
  }, [deck, sessionCards, onComplete])
  
  if (isComplete) {
    const accuracy = reviewedCount > 0 
      ? Math.round((correctCount / reviewedCount) * 100) 
      : 0
    
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="flex size-20 items-center justify-center rounded-full bg-success/20">
          <CheckCircle2 className="size-10 text-success" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Sessão Completa!</h2>
          <p className="mt-2 text-muted-foreground">
            Você revisou {reviewedCount} cards
          </p>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-success">{correctCount}</p>
            <p className="text-sm text-muted-foreground">Corretos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-destructive">{reviewedCount - correctCount}</p>
            <p className="text-sm text-muted-foreground">Erros</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{accuracy}%</p>
            <p className="text-sm text-muted-foreground">Precisão</p>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onExit}>
            <ArrowLeft className="mr-2 size-4" />
            Voltar aos Decks
          </Button>
          <Button onClick={handleComplete}>
            <Sparkles className="mr-2 size-4" />
            Salvar Progresso
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header da sessão */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="mr-2 size-4" />
          Sair
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {currentIndex + 1} / {sessionCards.length}
          </Badge>
          <Progress 
            value={((currentIndex) / sessionCards.length) * 100} 
            className="h-2 w-32"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-success" />
          {correctCount}
          <XCircle className="ml-2 size-4 text-destructive" />
          {reviewedCount - correctCount}
        </div>
      </div>
      
      {/* Card atual */}
      {currentCard && (
        <>
          <FlashcardItem 
            card={currentCard} 
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
          
          {/* Botões de rating (só aparecem quando virado) */}
          <div className={cn(
            "transition-opacity duration-300",
            isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <p className="mb-3 text-center text-sm text-muted-foreground">
              Quão bem você lembrou?
            </p>
            <RatingButtons onRate={handleRate} disabled={!isFlipped} />
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================================
// Componente StatsPanel - Painel de estatísticas
// ============================================================================

interface StatsPanelProps {
  stats: FlashcardStats
  decks: FlashcardDeck[]
}

function StatsPanel({ stats, decks }: StatsPanelProps) {
  const totalToReview = getCardsToReview(decks).length
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="size-5 text-primary" />
          Suas Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalCards}</p>
            <p className="text-xs text-muted-foreground">Total de Cards</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.cardsStudied}</p>
            <p className="text-xs text-muted-foreground">Cards Estudados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{totalToReview}</p>
            <p className="text-xs text-muted-foreground">Para Revisar</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="size-5 text-orange-500" />
              <p className="text-2xl font-bold">{stats.streak}</p>
            </div>
            <p className="text-xs text-muted-foreground">Dias Seguidos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Componente Principal - Página de Flashcards
// ============================================================================

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [stats, setStats] = useState<FlashcardStats | null>(null)
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null)
  const [studyMode, setStudyMode] = useState(false)
  const [studyCards, setStudyCards] = useState<Flashcard[]>([])
  
  // Carrega decks e stats
  useEffect(() => {
    setDecks(loadFlashcardDecks())
    setStats(loadFlashcardStats())
  }, [])
  
  // Inicia sessão de estudo
  const startStudy = useCallback((deck: FlashcardDeck, mode: "all" | "review" | "new") => {
    let cards: Flashcard[] = []
    
    if (mode === "all") {
      cards = [...deck.cards]
    } else if (mode === "review") {
      const now = Date.now()
      cards = deck.cards.filter(c => c.nextReview <= now && c.repetitions > 0)
    } else if (mode === "new") {
      cards = deck.cards.filter(c => c.repetitions === 0)
    }
    
    // Embaralha os cards
    cards = cards.sort(() => Math.random() - 0.5)
    
    if (cards.length === 0) {
      return
    }
    
    setStudyCards(cards)
    setStudyMode(true)
  }, [])
  
  // Completa sessão de estudo
  const handleSessionComplete = useCallback((updatedDeck: FlashcardDeck) => {
    const newDecks = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d)
    setDecks(newDecks)
    saveFlashcardDecks(newDecks)
    
    // Atualiza stats
    if (stats) {
      const newStats: FlashcardStats = {
        ...stats,
        cardsStudied: stats.cardsStudied + studyCards.length,
        lastStudyDate: Date.now(),
      }
      setStats(newStats)
      saveFlashcardStats(newStats)
    }
    
    setStudyMode(false)
    setSelectedDeck(null)
  }, [decks, stats, studyCards.length])
  
  // Sai da sessão
  const exitSession = useCallback(() => {
    setStudyMode(false)
    if (!selectedDeck) {
      setSelectedDeck(null)
    }
  }, [selectedDeck])
  
  // Modal de seleção de deck
  const DeckDetailModal = selectedDeck && !studyMode && (
    <Dialog open={!!selectedDeck} onOpenChange={() => setSelectedDeck(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(() => {
              const Icon = ICON_MAP[selectedDeck.icon] || Brain
              return <Icon className="size-5" style={{ color: selectedDeck.color }} />
            })()}
            {selectedDeck.name}
          </DialogTitle>
          <DialogDescription>{selectedDeck.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Stats do deck */}
          {(() => {
            const deckStats = getDeckStats(selectedDeck)
            return (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-blue-500/10 p-3 text-center">
                  <p className="text-xl font-bold text-blue-500">{deckStats.new}</p>
                  <p className="text-xs text-muted-foreground">Novos</p>
                </div>
                <div className="rounded-lg bg-yellow-500/10 p-3 text-center">
                  <p className="text-xl font-bold text-yellow-500">{deckStats.learning}</p>
                  <p className="text-xs text-muted-foreground">Aprendendo</p>
                </div>
                <div className="rounded-lg bg-orange-500/10 p-3 text-center">
                  <p className="text-xl font-bold text-orange-500">{deckStats.review}</p>
                  <p className="text-xs text-muted-foreground">Revisar</p>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3 text-center">
                  <p className="text-xl font-bold text-green-500">{deckStats.mastered}</p>
                  <p className="text-xs text-muted-foreground">Dominados</p>
                </div>
              </div>
            )
          })()}
          
          {/* Botões de estudo */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => startStudy(selectedDeck, "all")}
              className="w-full"
            >
              <Star className="mr-2 size-4" />
              Estudar Todos ({selectedDeck.cards.length})
            </Button>
            <Button 
              variant="outline"
              onClick={() => startStudy(selectedDeck, "new")}
              className="w-full"
              disabled={getDeckStats(selectedDeck).new === 0}
            >
              <Sparkles className="mr-2 size-4" />
              Apenas Novos ({getDeckStats(selectedDeck).new})
            </Button>
            <Button 
              variant="outline"
              onClick={() => startStudy(selectedDeck, "review")}
              className="w-full"
              disabled={getDeckStats(selectedDeck).review === 0}
            >
              <RotateCcw className="mr-2 size-4" />
              Revisar Pendentes ({getDeckStats(selectedDeck).review})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
  
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
              <Brain className="size-5 text-primary" />
              <span className="font-semibold">Flashcards</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/treinar">
              <Button variant="outline" size="sm">
                <GraduationCap className="mr-2 size-4" />
                Treinar
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-6">
        {studyMode && selectedDeck ? (
          <StudySession
            deck={selectedDeck}
            cards={studyCards}
            onComplete={handleSessionComplete}
            onExit={exitSession}
          />
        ) : (
          <div className="space-y-6">
            {/* Hero */}
            <div className="text-center">
              <h1 className="text-3xl font-bold">Flashcards de C</h1>
              <p className="mt-2 text-muted-foreground">
                Memorize conceitos com repetição espaçada (algoritmo SM-2)
              </p>
            </div>
            
            {/* Stats */}
            {stats && <StatsPanel stats={stats} decks={decks} />}
            
            {/* Decks */}
            <div>
              <h2 className="mb-4 text-xl font-semibold">Decks de Estudo</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {decks.map(deck => (
                  <DeckCard 
                    key={deck.id} 
                    deck={deck} 
                    onSelect={() => setSelectedDeck(deck)}
                  />
                ))}
              </div>
            </div>
            
            {/* Info sobre SM-2 */}
            <Card className="bg-secondary/30">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Como funciona a Repetição Espaçada?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    O algoritmo SM-2 calcula o momento ideal para revisar cada card baseado em quão bem você lembrou. 
                    Cards fáceis aparecem com menos frequência, enquanto cards difíceis aparecem mais vezes até você dominar.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      {/* Modal de detalhes do deck */}
      {DeckDetailModal}
      
      {/* CSS para flip animation */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}
