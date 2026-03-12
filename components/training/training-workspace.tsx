"use client"

import { useState, useCallback, useEffect } from "react"
import {
  type Exercise,
  type Language,
  getLanguageLabel,
  getExercisesByLanguage,
} from "@/lib/exercises"
import {
  validateNorminette,
  generateHeader42,
  type NorminetteError,
} from "@/lib/norminette"
import {
  type UserProfile,
  type XPGain,
  type Achievement,
  loadUserProfile,
  awardExerciseCompletion,
} from "@/lib/gamification"
import { CodeEditor } from "./code-editor"
import { TerminalOutput, type OutputMessage } from "./terminal-output"
import { ExerciseList } from "./exercise-list"
import { ExerciseDetail } from "./exercise-detail"
import { ActionButtons } from "./action-buttons"
import { ProgressTracker } from "./progress-tracker"
import { Timer } from "./timer"
import { Footer } from "./footer"
import { GamificationStats } from "@/components/gamification/gamification-stats"
import { XPPopup } from "@/components/gamification/xp-popup"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Menu, Code2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TooltipProvider } from "@/components/ui/tooltip"

const INITIAL_MESSAGES: OutputMessage[] = [
  {
    type: "command",
    text: "Sistema inicializado.",
  },
  {
    type: "info",
    text: "Selecione um exercicio na barra lateral para comecar.",
  },
  {
    type: "info",
    text: "Use a dica se travar. Tente resolver antes de ver a solucao.",
  },
]

export function TrainingWorkspace() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  )
  const [code, setCode] = useState("")
  const [messages, setMessages] = useState<OutputMessage[]>(INITIAL_MESSAGES)
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeLanguage, setActiveLanguage] = useState<Language>("c")
  const [showCodeModal, setShowCodeModal] = useState(false)
  
  // Gamification state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [usedHint, setUsedHint] = useState(false)
  const [usedSolution, setUsedSolution] = useState(false)
  const [showXPPopup, setShowXPPopup] = useState(false)
  const [lastXPGain, setLastXPGain] = useState<XPGain | null>(null)
  const [lastAchievements, setLastAchievements] = useState<Achievement[]>([])
  const [lastLevelUp, setLastLevelUp] = useState(false)
  const [previousLevel, setPreviousLevel] = useState(1)
  
  // Load user profile on mount
  useEffect(() => {
    setUserProfile(loadUserProfile())
  }, [])

  const addMessage = useCallback((msg: OutputMessage) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const addMessages = useCallback((msgs: OutputMessage[]) => {
    setMessages((prev) => [...prev, ...msgs])
  }, [])

  const goHome = useCallback(() => {
    setSelectedExercise(null)
    setCode("")
    setMessages(INITIAL_MESSAGES)
  }, [])

  const selectExercise = useCallback(
    (ex: Exercise) => {
      setSelectedExercise(ex)
      // Reset hint/solution tracking for new exercise
      setUsedHint(false)
      setUsedSolution(false)
      // Para linguagem C, adicionar header 42 antes do template
      if (ex.language === "c") {
        const filename = `${ex.func}.c`
        const header = generateHeader42(filename)
        setCode(`${header}\n\n${ex.template}`)
      } else {
        setCode(ex.template)
      }
      const initialMessages: OutputMessage[] = [
        {
          type: "command",
          text: `Carregando: ${ex.title} (${getLanguageLabel(ex.language)})`,
        },
        { type: "separator", text: "" },
        { type: "info", text: ex.description },
      ]
      // Adicionar aviso sobre norminette para C
      if (ex.language === "c") {
        initialMessages.push({
          type: "info",
          text: "Header 42 incluido. Seu codigo sera validado pela Norminette.",
        })
      }
      initialMessages.push({ type: "info", text: "Resolva sem olhar a solucao. Boa sorte!" })
      setMessages(initialMessages)
      setSidebarOpen(false)
    },
    [],
  )

  const handleHint = useCallback(() => {
    if (!selectedExercise) return
    setUsedHint(true)
    addMessages([
      { type: "separator", text: "" },
      { type: "hint", text: selectedExercise.hint },
    ])
  }, [selectedExercise, addMessages])

  const handleSolution = useCallback(() => {
    if (!selectedExercise) return
    setUsedSolution(true)
    // Para C, adicionar header 42 na solucao
    if (selectedExercise.language === "c") {
      const filename = `${selectedExercise.func}.c`
      const header = generateHeader42(filename)
      setCode(`${header}\n\n${selectedExercise.solution}`)
    } else {
      setCode(selectedExercise.solution)
    }
    addMessages([
      { type: "separator", text: "" },
      {
        type: "warning",
        text: "Solucao carregada no editor.",
      },
      {
        type: "info",
        text: "Estude a solucao, entenda cada linha e reescreva de memoria.",
      },
    ])
  }, [selectedExercise, addMessages])

  const handleExplanation = useCallback(() => {
    if (!selectedExercise) return
    addMessages([
      { type: "separator", text: "" },
      { type: "command", text: "Explicacao passo a passo:" },
      ...selectedExercise.explanation.map(
        (step) => ({ type: "explanation" as const, text: step }),
      ),
    ])
  }, [selectedExercise, addMessages])

  const handleViewCode = useCallback(() => {
    if (!selectedExercise) return
    setShowCodeModal(true)
  }, [selectedExercise])

  const handleCheck = useCallback(() => {
    if (!selectedExercise) return

    const trimmedCode = code.replace(/\s+/g, " ").trim()
    const trimmedSolution = selectedExercise.solution
      .replace(/\s+/g, " ")
      .trim()

    const hasFunction = code.includes(selectedExercise.func)

    const checks: { label: string; passed: boolean }[] = [
      {
        label: `Funcao/script ${selectedExercise.func} presente`,
        passed: hasFunction,
      },
    ]

    if (selectedExercise.checkPatterns) {
      selectedExercise.checkPatterns.forEach((pattern) => {
        const regex = new RegExp(pattern)
        const passed = regex.test(code)
        const label = pattern
          .replace(/\\\\/g, "\\")
          .replace(/\|/g, " ou ")
          .replace(/\.\*/g, " ")
        checks.push({
          label: `Padrao "${label}" encontrado`,
          passed,
        })
      })
    }

    // Declarar newMessages antes de usar
    const newMessages: OutputMessage[] = [
      { type: "separator", text: "" },
      { type: "command", text: `Verificando: ${selectedExercise.title}` },
    ]

    // Armazenar erros de norminette para adicionar ao final
    let norminetteMessages: OutputMessage[] = []

    if (selectedExercise.language === "c") {
      // Validacao Norminette para C
      const norminetteErrors = validateNorminette(code)
      const criticalErrors = norminetteErrors.filter(e => e.severity === "error")
      
      // Check header 42
      checks.push({
        label: "Header 42 presente",
        passed: code.includes("/* ****") && code.includes(":::      ::::::::   */"),
      })
      
      // Check norminette
      checks.push({
        label: `Norminette: ${criticalErrors.length} erros`,
        passed: criticalErrors.length === 0,
      })
      
      if (/while|for/.test(selectedExercise.solution)) {
        checks.push({
          label: "Loop (while/for) presente",
          passed: /while|for/.test(code),
        })
      }
      if (selectedExercise.solution.includes("return")) {
        checks.push({
          label: "Return statement presente",
          passed: code.includes("return"),
        })
      }
      
      // Preparar mensagens de norminette para adicionar depois
      if (norminetteErrors.length > 0) {
        norminetteMessages.push({ type: "separator", text: "" })
        norminetteMessages.push({ type: "command", text: "Norminette:" })
        norminetteErrors.slice(0, 10).forEach(err => {
          norminetteMessages.push({
            type: err.severity === "error" ? "error" : "warning",
            text: `Linha ${err.line}: ${err.message}`,
          })
        })
        if (norminetteErrors.length > 10) {
          norminetteMessages.push({
            type: "info",
            text: `... e mais ${norminetteErrors.length - 10} problemas.`,
          })
        }
      } else {
        norminetteMessages.push({ type: "success", text: "Norminette: OK!" })
      }
    }

    if (selectedExercise.language === "shell") {
      if (selectedExercise.solution.includes("#!/bin/bash")) {
        checks.push({
          label: "Shebang (#!/bin/bash) presente",
          passed: code.includes("#!/bin/bash"),
        })
      }
    }

    if (selectedExercise.language === "python") {
      if (selectedExercise.solution.includes("def ")) {
        checks.push({
          label: "Funcao definida com def",
          passed: code.includes("def "),
        })
      }
      const hasIndentation = code.split("\n").some((line) =>
        line.startsWith("    ") || line.startsWith("\t"),
      )
      checks.push({
        label: "Indentacao presente no corpo",
        passed: hasIndentation,
      })
    }

    const allPassed = checks.every((c) => c.passed)
    const passedCount = checks.filter((c) => c.passed).length

    checks.forEach((c) => {
      newMessages.push({
        type: c.passed ? "success" : "error",
        text: `${c.passed ? "PASS" : "FAIL"}: ${c.label}`,
      })
    })

    newMessages.push({ type: "separator", text: "" })

    // Helper function to award XP for exercise completion
    const handleExerciseComplete = () => {
      if (!userProfile) return
      if (completedIds.has(selectedExercise.id)) return // Already completed before
      
      const result = awardExerciseCompletion(userProfile, usedHint, usedSolution)
      setUserProfile(result.profile)
      setLastXPGain(result.xpGain)
      setLastAchievements(result.newAchievements)
      setLastLevelUp(result.leveledUp)
      setPreviousLevel(result.previousLevel)
      setShowXPPopup(true)
    }
    
    if (trimmedCode === trimmedSolution) {
      newMessages.push({
        type: "success",
        text: "Codigo identico a solucao de referencia! Exercicio concluido.",
      })
      if (!completedIds.has(selectedExercise.id)) {
        setCompletedIds((prev) => new Set([...prev, selectedExercise.id]))
        handleExerciseComplete()
      }
    } else if (allPassed) {
      newMessages.push({
        type: "success",
        text: `Todas as ${checks.length} verificacoes passaram! Exercicio concluido.`,
      })
      newMessages.push({
        type: "info",
        text: "Compare com a solucao de referencia para melhorar ainda mais.",
      })
      if (!completedIds.has(selectedExercise.id)) {
        setCompletedIds((prev) => new Set([...prev, selectedExercise.id]))
        handleExerciseComplete()
      }
    } else {
      newMessages.push({
        type: "warning",
        text: `${passedCount}/${checks.length} verificacoes passaram. Continue tentando!`,
      })
    }

    // Adicionar mensagens de norminette ao final (apenas para C)
    if (norminetteMessages.length > 0) {
      newMessages.push(...norminetteMessages)
    }

    addMessages(newMessages)
  }, [selectedExercise, code, addMessages, userProfile, completedIds, usedHint, usedSolution])

  const handleClear = useCallback(() => {
    setCode("")
    addMessage({ type: "info", text: "Editor limpo." })
  }, [addMessage])

  const handleReset = useCallback(() => {
    if (!selectedExercise) return
    // Para C, adicionar header 42 no reset
    if (selectedExercise.language === "c") {
      const filename = `${selectedExercise.func}.c`
      const header = generateHeader42(filename)
      setCode(`${header}\n\n${selectedExercise.template}`)
    } else {
      setCode(selectedExercise.template)
    }
    addMessage({ type: "info", text: "Template restaurado." })
  }, [selectedExercise, addMessage])

  const handleClearTerminal = useCallback(() => {
    setMessages([
      { type: "command", text: "Terminal limpo." },
    ])
  }, [])

  // Left sidebar: Stats (gamification + progress)
  const statsContent = (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
      {userProfile && (
        <GamificationStats 
          profile={userProfile} 
          variant="sidebar" 
          className="mx-3 shrink-0" 
        />
      )}
      <ProgressTracker
        completedIds={completedIds}
        activeLanguage={activeLanguage}
        className="mx-3 shrink-0"
      />
    </div>
  )

  // Right sidebar: Exercises list
  const exercisesContent = (
    <div className="flex min-h-0 flex-1 flex-col py-4">
      <ExerciseList
        selectedId={selectedExercise?.id ?? null}
        completedIds={completedIds}
        onSelect={selectExercise}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
        className="min-h-0 flex-1"
      />
    </div>
  )

  return (
    <TooltipProvider>
      <div className="flex h-[100dvh] flex-col bg-background">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-3 py-2 md:px-6">
          <div className="flex items-center gap-3">
            {/* Back to home */}
            <Link
              href="/"
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Voltar para a pagina inicial"
            >
              <ArrowLeft className="size-5" />
            </Link>

            <button
              onClick={goHome}
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
              aria-label="Voltar para a pagina inicial"
            >
              <img
                src="/images/logo.png"
                alt="Treino PRO Logo"
                className="h-16 w-16 rounded-md object-contain md:h-20 md:w-20"
              />
              <div className="flex flex-col">
                <h1 className="text-sm font-bold leading-tight text-foreground md:text-base">
                  Treino PRO
                </h1>
                <span className="hidden text-[10px] leading-tight text-muted-foreground md:inline">
                  Plataforma de Estudos - 42 SP
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Gamification Stats in Header (compact) */}
            {userProfile && (
              <div className="hidden md:block">
                <GamificationStats profile={userProfile} variant="header" />
              </div>
            )}
            <Timer />
            
            {/* Mobile menu - Right side */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 lg:hidden"
                  aria-label="Abrir menu de exercicios"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[300px] flex-col p-0" aria-describedby="sheet-desc">
                <SheetHeader className="shrink-0 border-b border-border px-4 py-3">
                  <SheetTitle className="flex items-center gap-2 text-sm">
                    <Code2 className="size-4 text-primary" />
                    Exercicios
                  </SheetTitle>
                  <SheetDescription id="sheet-desc" className="sr-only">
                    Lista de exercicios disponiveis
                  </SheetDescription>
                </SheetHeader>
                {exercisesContent}
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main content */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left sidebar - Stats (gamification + progress) */}
          <aside className="hidden w-[260px] shrink-0 overflow-hidden border-r border-border bg-card lg:flex lg:flex-col">
            {statsContent}
          </aside>

          {/* Editor area */}
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {selectedExercise ? (
              <ExerciseWorkArea
                exercise={selectedExercise}
                code={code}
                messages={messages}
                onCodeChange={setCode}
                onHint={handleHint}
                onSolution={handleSolution}
                onCheck={handleCheck}
                onClear={handleClear}
                onExplanation={handleExplanation}
                onReset={handleReset}
                onViewCode={handleViewCode}
                onClearTerminal={handleClearTerminal}
              />
            ) : (
              <div className="flex-1 overflow-y-auto p-3 md:p-4">
                <EmptyState onSelectLanguage={setActiveLanguage} />
              </div>
)}
            </main>

          {/* Right sidebar - Exercises list */}
          <aside className="hidden w-[260px] shrink-0 overflow-hidden border-l border-border bg-card lg:flex lg:flex-col">
            {exercisesContent}
          </aside>
        </div>

        {/* Footer - hidden when exercise active on mobile for space */}
        {!selectedExercise && <Footer />}
        <div className="hidden md:block">
          {selectedExercise && <Footer />}
        </div>

        {/* Code Solution Modal */}
        {selectedExercise && (
          <Dialog open={showCodeModal} onOpenChange={setShowCodeModal}>
            <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden border-border bg-card">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-mono text-foreground">
                  <Code2 className="size-5 text-primary" />
                  {selectedExercise.title} - Codigo Completo
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Codigo de solucao e exemplo de uso para {selectedExercise.title}
                </DialogDescription>
              </DialogHeader>
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-primary">Solucao de Referencia</span>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-terminal p-4 font-mono text-xs leading-relaxed text-terminal-foreground md:text-sm">
                    <code>{selectedExercise.solution}</code>
                  </pre>
                </div>

                {selectedExercise.exampleUsage && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-accent">Exemplo de Uso (main/teste)</span>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-terminal p-4 font-mono text-xs leading-relaxed text-terminal-foreground md:text-sm">
                      <code>{selectedExercise.exampleUsage}</code>
                    </pre>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-warning">Explicacao Passo a Passo</span>
                  <div className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-3">
                    {selectedExercise.explanation.map((step, i) => (
                      <p key={i} className="text-xs leading-relaxed text-foreground/80">
                        {step}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* XP Popup when exercise completed */}
        {userProfile && (
          <XPPopup
            open={showXPPopup}
            onClose={() => setShowXPPopup(false)}
            xpGain={lastXPGain}
            newAchievements={lastAchievements}
            leveledUp={lastLevelUp}
            previousLevel={previousLevel}
            newLevel={userProfile.level}
            streak={userProfile.streak}
          />
        )}
      </div>
    </TooltipProvider>
  )
}

/* ── Exercise work area (extracted for clarity) ──────────────────── */

interface ExerciseWorkAreaProps {
  exercise: Exercise
  code: string
  messages: OutputMessage[]
  onCodeChange: (v: string) => void
  onHint: () => void
  onSolution: () => void
  onCheck: () => void
  onClear: () => void
  onExplanation: () => void
  onReset: () => void
  onViewCode: () => void
  onClearTerminal: () => void
}

function ExerciseWorkArea({
  exercise,
  code,
  messages,
  onCodeChange,
  onHint,
  onSolution,
  onCheck,
  onClear,
  onExplanation,
  onReset,
  onViewCode,
  onClearTerminal,
}: ExerciseWorkAreaProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 md:gap-3 md:p-4">
      {/* Info + buttons: compact, auto-fit */}
      <div className="shrink-0">
        <div className="flex flex-col gap-2">
          <ExerciseDetail exercise={exercise} />
          <ActionButtons
            onHint={onHint}
            onSolution={onSolution}
            onCheck={onCheck}
            onClear={onClear}
            onExplanation={onExplanation}
            onReset={onReset}
            onViewCode={onViewCode}
            disabled={false}
          />
        </div>
      </div>

      {/* Desktop: side-by-side code + terminal | Mobile: stacked */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row lg:gap-3">
        <CodeEditor
          value={code}
          onChange={onCodeChange}
          language={exercise.language}
          className="min-h-[120px] flex-[3] lg:min-h-0"
        />
        <TerminalOutput
          messages={messages}
          onClear={onClearTerminal}
          className="min-h-[100px] flex-[2] lg:min-h-0"
        />
      </div>
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────────────── */

function EmptyState({ onSelectLanguage }: { onSelectLanguage: (lang: Language) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
      <img
        src="/images/logo.png"
        alt="Treino PRO Logo"
        className="h-[180px] w-[180px] rounded-xl object-contain md:h-[240px] md:w-[240px]"
      />
      <div className="flex flex-col gap-2">
        <h2 className="text-balance text-lg font-bold text-foreground md:text-xl">
          Bem-vindo ao Treino PRO
        </h2>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
          Plataforma de Estudos e Preparacao para a 42 Sao Paulo. Selecione um
          exercicio na barra lateral para comecar a praticar C, Shell ou Python.
        </p>
      </div>

      <div className="grid w-full max-w-sm grid-cols-3 gap-3">
        {([
          { lang: "c" as Language, label: "C", count: getExercisesByLanguage("c").length, color: "text-primary" },
          { lang: "shell" as Language, label: "Shell", count: getExercisesByLanguage("shell").length, color: "text-accent" },
          { lang: "python" as Language, label: "Python", count: getExercisesByLanguage("python").length, color: "text-warning" },
        ]).map((item) => (
          <button
            key={item.lang}
            onClick={() => onSelectLanguage(item.lang)}
            className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span className={`font-mono text-lg font-bold ${item.color}`}>{item.label}</span>
            <span className="text-[10px] text-muted-foreground">
              {item.count} exercicios
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          Dicas para sua Piscine:
        </span>
        <ul className="flex flex-col gap-1.5 text-left">
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-success" />
            Tente resolver sozinho primeiro
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-warning" />
            Use a dica se travar por mais de 10 minutos
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-accent" />
            Estude a solucao e reescreva de memoria
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
            Entenda o conceito, nao decore
          </li>
        </ul>
      </div>
    </div>
  )
}
