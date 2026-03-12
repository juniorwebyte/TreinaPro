"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import {
  type ExamSession,
  type ExamResult,
  type ExamHistory,
  EXAM_DURATION,
  createExamSession,
  getExerciseById,
  validateExamSolution,
  loadExamHistory,
  saveExamSession,
  formatTime,
  formatDate,
} from "@/lib/exam-simulator"
import { type Exercise } from "@/lib/exercises"
import { generateHeader42 } from "@/lib/norminette"
import { CodeEditor } from "@/components/training/code-editor"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  ArrowLeft,
  Clock,
  Play,
  Send,
  History,
  Trophy,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ExamState = "idle" | "running" | "submitted" | "timeout"

export default function ExamSimulatorPage() {
  const [examState, setExamState] = useState<ExamState>("idle")
  const [session, setSession] = useState<ExamSession | null>(null)
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [code, setCode] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(EXAM_DURATION)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [history, setHistory] = useState<ExamHistory | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load history on mount
  useEffect(() => {
    setHistory(loadExamHistory())
  }, [])

  // Timer logic
  useEffect(() => {
    if (examState === "running" && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [examState])

  const handleTimeout = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setExamState("timeout")
    
    if (session && exercise) {
      const timeSpent = EXAM_DURATION - timeRemaining
      const examResult = validateExamSolution(code, exercise, timeSpent)
      setResult(examResult)
      
      const updatedSession: ExamSession = {
        ...session,
        endTime: new Date().toISOString(),
        userCode: code,
        status: "timeout",
        score: examResult.score,
        timeSpent,
      }
      saveExamSession(updatedSession)
      setHistory(loadExamHistory())
    }
  }, [session, exercise, code, timeRemaining])

  const startExam = useCallback(() => {
    const newSession = createExamSession()
    const exerciseData = getExerciseById(newSession.exerciseId)
    
    if (!exerciseData) {
      console.error("Exercicio nao encontrado")
      return
    }

    const filename = `${exerciseData.func}.c`
    const header = generateHeader42(filename)
    const initialCode = `${header}\n\n${exerciseData.template}`

    setSession(newSession)
    setExercise(exerciseData)
    setCode(initialCode)
    setTimeRemaining(EXAM_DURATION)
    setExamState("running")
    setResult(null)
  }, [])

  const submitExam = useCallback(() => {
    if (!session || !exercise) return
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const timeSpent = EXAM_DURATION - timeRemaining
    const examResult = validateExamSolution(code, exercise, timeSpent)
    setResult(examResult)
    setExamState("submitted")

    const updatedSession: ExamSession = {
      ...session,
      endTime: new Date().toISOString(),
      userCode: code,
      status: "submitted",
      score: examResult.score,
      timeSpent,
    }
    saveExamSession(updatedSession)
    setHistory(loadExamHistory())
  }, [session, exercise, code, timeRemaining])

  const resetExam = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setExamState("idle")
    setSession(null)
    setExercise(null)
    setCode("")
    setTimeRemaining(EXAM_DURATION)
    setResult(null)
  }, [])

  // Timer color based on time remaining
  const timerColor = timeRemaining < 1800 
    ? "text-destructive" 
    : timeRemaining < 3600 
      ? "text-warning" 
      : "text-foreground"

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Target className="size-6 text-primary" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Simulacao de Exame</h1>
                <p className="text-xs text-muted-foreground">Modo exam02 - 42 SP</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {examState === "running" && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-mono text-xl font-bold",
                timerColor
              )}>
                <Clock className="size-5" />
                {formatTime(timeRemaining)}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="gap-2"
            >
              <History className="size-4" />
              <span className="hidden sm:inline">Historico</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col p-4 md:p-6">
          {examState === "idle" && (
            <IdleState 
              onStart={startExam} 
              history={history}
            />
          )}

          {examState === "running" && exercise && (
            <RunningState
              exercise={exercise}
              code={code}
              onCodeChange={setCode}
              onSubmit={submitExam}
              timeRemaining={timeRemaining}
            />
          )}

          {(examState === "submitted" || examState === "timeout") && result && (
            <ResultState
              result={result}
              examState={examState}
              onRetry={resetExam}
              onGoHome={resetExam}
            />
          )}
        </main>

        {/* History Dialog */}
        <HistoryDialog
          open={showHistory}
          onOpenChange={setShowHistory}
          history={history}
        />
      </div>
    </TooltipProvider>
  )
}

// ==================== IDLE STATE ====================
function IdleState({ 
  onStart, 
  history 
}: { 
  onStart: () => void
  history: ExamHistory | null 
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
          <Target className="size-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Simulacao do Exam02</h2>
        <p className="max-w-md text-muted-foreground">
          Teste seus conhecimentos em um ambiente que simula as condicoes reais do exame da 42. 
          Voce tera 3 horas para resolver um exercicio aleatorio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <CardHeader className="pb-2">
            <Clock className="mx-auto size-8 text-primary" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">3 Horas</CardTitle>
            <CardDescription>Tempo total</CardDescription>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader className="pb-2">
            <AlertTriangle className="mx-auto size-8 text-warning" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Sem Dicas</CardTitle>
            <CardDescription>Modo exame real</CardDescription>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader className="pb-2">
            <Trophy className="mx-auto size-8 text-success" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">70% para passar</CardTitle>
            <CardDescription>Pontuacao minima</CardDescription>
          </CardContent>
        </Card>
      </div>

      {history && history.totalAttempts > 0 && (
        <div className="flex items-center gap-6 rounded-lg border border-border bg-card px-6 py-3 text-sm">
          <div className="flex flex-col items-center">
            <span className="font-mono text-lg font-bold text-foreground">{history.totalAttempts}</span>
            <span className="text-xs text-muted-foreground">Tentativas</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center">
            <span className="font-mono text-lg font-bold text-success">{history.passedAttempts}</span>
            <span className="text-xs text-muted-foreground">Aprovacoes</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center">
            <span className="font-mono text-lg font-bold text-primary">{history.bestScore}%</span>
            <span className="text-xs text-muted-foreground">Melhor Score</span>
          </div>
        </div>
      )}

      <Button size="lg" onClick={onStart} className="gap-2">
        <Play className="size-5" />
        Iniciar Simulacao
      </Button>
    </div>
  )
}

// ==================== RUNNING STATE ====================
function RunningState({
  exercise,
  code,
  onCodeChange,
  onSubmit,
  timeRemaining,
}: {
  exercise: Exercise
  code: string
  onCodeChange: (code: string) => void
  onSubmit: () => void
  timeRemaining: number
}) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Exercise Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="font-mono text-primary">{exercise.func}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {exercise.difficulty}
                </span>
              </CardTitle>
              <CardDescription className="mt-1">{exercise.title}</CardDescription>
            </div>
            <Button onClick={() => setShowConfirm(true)} className="gap-2">
              <Send className="size-4" />
              Enviar Resposta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-secondary/30 p-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Descricao
            </h4>
            <p className="text-sm text-foreground">{exercise.description}</p>
            <div className="mt-3 border-t border-border pt-3">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Conceito
              </h4>
              <p className="text-sm text-foreground/80">{exercise.concept}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <CodeEditor
        value={code}
        onChange={onCodeChange}
        language="c"
        className="min-h-[400px] flex-1"
      />

      {/* Confirm Submit Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Envio</DialogTitle>
            <DialogDescription>
              Voce tem certeza que deseja enviar sua resposta? Ainda restam {formatTime(timeRemaining)} no relogio.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { setShowConfirm(false); onSubmit(); }}>
              Enviar Resposta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== RESULT STATE ====================
function ResultState({
  result,
  examState,
  onRetry,
  onGoHome,
}: {
  result: ExamResult
  examState: "submitted" | "timeout"
  onRetry: () => void
  onGoHome: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "flex size-24 items-center justify-center rounded-full",
          result.passed ? "bg-success/20" : "bg-destructive/20"
        )}>
          {result.passed ? (
            <CheckCircle2 className="size-12 text-success" />
          ) : (
            <XCircle className="size-12 text-destructive" />
          )}
        </div>
        
        <h2 className={cn(
          "text-3xl font-bold",
          result.passed ? "text-success" : "text-destructive"
        )}>
          {result.passed ? "Aprovado!" : "Reprovado"}
        </h2>
        
        {examState === "timeout" && (
          <span className="rounded-full bg-warning/20 px-3 py-1 text-sm text-warning">
            Tempo Esgotado
          </span>
        )}
      </div>

      {/* Score */}
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
          <span className={cn(
            "font-mono text-6xl font-bold",
            result.passed ? "text-success" : "text-destructive"
          )}>
            {result.score}
          </span>
          <span className="text-sm text-muted-foreground">Pontuacao</span>
        </div>
        <div className="h-16 w-px bg-border" />
        <div className="flex flex-col items-center">
          <span className="font-mono text-2xl font-bold text-foreground">
            {formatTime(result.timeSpent)}
          </span>
          <span className="text-sm text-muted-foreground">Tempo Usado</span>
        </div>
      </div>

      {/* Checks */}
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Verificacoes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {result.checksRan.map((check, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  check.passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}
              >
                {check.passed ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <XCircle className="size-4" />
                )}
                {check.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {result.feedback.map((fb, idx) => (
              <li key={idx}>• {fb}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onGoHome}>
          Voltar ao Inicio
        </Button>
        <Button onClick={onRetry} className="gap-2">
          <RotateCcw className="size-4" />
          Tentar Novamente
        </Button>
      </div>
    </div>
  )
}

// ==================== HISTORY DIALOG ====================
function HistoryDialog({
  open,
  onOpenChange,
  history,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  history: ExamHistory | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Historico de Exames
          </DialogTitle>
          <DialogDescription>
            Suas ultimas tentativas de simulacao
          </DialogDescription>
        </DialogHeader>

        {history && history.sessions.length > 0 ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 rounded-lg bg-secondary/30 p-3 text-center">
              <div>
                <span className="block font-mono text-lg font-bold text-foreground">
                  {history.totalAttempts}
                </span>
                <span className="text-[10px] text-muted-foreground">Total</span>
              </div>
              <div>
                <span className="block font-mono text-lg font-bold text-success">
                  {history.passedAttempts}
                </span>
                <span className="text-[10px] text-muted-foreground">Aprovados</span>
              </div>
              <div>
                <span className="block font-mono text-lg font-bold text-primary">
                  {history.averageScore}%
                </span>
                <span className="text-[10px] text-muted-foreground">Media</span>
              </div>
              <div>
                <span className="block font-mono text-lg font-bold text-warning">
                  {history.bestScore}%
                </span>
                <span className="text-[10px] text-muted-foreground">Melhor</span>
              </div>
            </div>

            {/* Session List */}
            <ScrollArea className="max-h-[300px] pr-4">
              <div className="flex flex-col gap-2">
                {history.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2",
                      (session.score ?? 0) >= 70 
                        ? "border-success/30 bg-success/5" 
                        : "border-destructive/30 bg-destructive/5"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {session.exerciseTitle}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(session.startTime)} • {formatTime(session.timeSpent)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-mono text-lg font-bold",
                        (session.score ?? 0) >= 70 ? "text-success" : "text-destructive"
                      )}>
                        {session.score}%
                      </span>
                      {(session.score ?? 0) >= 70 ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : (
                        <XCircle className="size-4 text-destructive" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
            <History className="size-10 text-muted-foreground/50" />
            <p>Nenhuma tentativa registrada ainda.</p>
            <p className="text-sm">Inicie uma simulacao para comecar!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
