"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Lock, Key, AlertTriangle, CheckCircle, XCircle, Clock, Code2, ShieldCheck, ArrowRight, LogOut, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  getAccessState,
  isLockedOut,
  validateAdminCredentials,
  grantAccess,
  recordFailedAttempt,
  revokeAccess,
  examQuestions,
  formatTimeRemaining,
  getMaxAttempts,
  type ExamQuestion
} from "@/lib/exam-access"

interface ExamAccessGateProps {
  children: React.ReactNode
}

type GateMode = "locked" | "exam" | "admin" | "result"

export function ExamAccessGate({ children }: ExamAccessGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [mode, setMode] = useState<GateMode>("locked")
  const [lockoutTime, setLockoutTime] = useState(0)
  const [attempts, setAttempts] = useState(0)
  
  // Admin login state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [adminError, setAdminError] = useState("")
  
  // Exam state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [examResult, setExamResult] = useState<{ passed: boolean; score: number } | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  
  // Carregar estado inicial e sincronizar com mudancas de localStorage
  useEffect(() => {
    const loadAccessState = () => {
      const state = getAccessState()
      setHasAccess(state.hasAccess)
      setAttempts(state.attempts)
      
      const lockStatus = isLockedOut()
      if (lockStatus.locked) {
        setLockoutTime(lockStatus.remainingTime)
      }
    }

    loadAccessState()

    // Sincroniza quando o localStorage muda em outra aba/janela
    const handleStorageChange = () => {
      loadAccessState()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])
  
  // Timer para lockout
  useEffect(() => {
    if (lockoutTime <= 0) return
    
    const interval = setInterval(() => {
      const lockStatus = isLockedOut()
      if (!lockStatus.locked) {
        setLockoutTime(0)
        setAttempts(0)
      } else {
        setLockoutTime(lockStatus.remainingTime)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [lockoutTime])
  
  const handleAdminLogin = useCallback(() => {
    setAdminError("")
    
    if (validateAdminCredentials(username, password)) {
      grantAccess()
      setHasAccess(true)
    } else {
      const result = recordFailedAttempt()
      setAttempts(getMaxAttempts() - result.attemptsLeft)
      
      if (result.locked) {
        const lockStatus = isLockedOut()
        setLockoutTime(lockStatus.remainingTime)
        setAdminError("Muitas tentativas falhas. Aguarde 5 minutos.")
        setMode("locked")
      } else {
        setAdminError(`Credenciais invalidas. ${result.attemptsLeft} tentativa(s) restante(s).`)
      }
    }
  }, [username, password])
  
  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }))
  }
  
  const handleNextQuestion = () => {
    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setShowExplanation(false)
    } else {
      // Calcular resultado
      const correctCount = examQuestions.filter(
        q => selectedAnswers[q.id] === q.correctAnswer
      ).length
      const passed = correctCount >= Math.ceil(examQuestions.length * 0.8) // 80% para passar
      
      setExamResult({ passed, score: correctCount })
      setMode("result")
      
      if (passed) {
        grantAccess()
        setHasAccess(true)
      } else {
        const result = recordFailedAttempt()
        setAttempts(getMaxAttempts() - result.attemptsLeft)
        
        if (result.locked) {
          const lockStatus = isLockedOut()
          setLockoutTime(lockStatus.remainingTime)
        }
      }
    }
  }
  
  const handleRetryExam = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setExamResult(null)
    setShowExplanation(false)
    setMode("exam")
  }
  
  // Loading state
  if (hasAccess === null) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Verificando acesso...</div>
      </div>
    )
  }
  
  // Acesso liberado — renderiza conteudo com botao de logout no topo
  if (hasAccess) {
    const handleLogout = () => {
      revokeAccess()
      setHasAccess(false)
      setMode("locked")
      setUsername("")
      setPassword("")
      setAdminError("")
      setCurrentQuestion(0)
      setSelectedAnswers({})
      setExamResult(null)
    }

    return (
      <div className="relative">
        <div className="fixed right-20 top-4 z-[60]">
          <Button
            variant="destructive"
            size="sm"
            className="gap-2 shadow-lg"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Sair do Acesso
          </Button>
        </div>
        {children}
      </div>
    )
  }
  
  // Locked out
  const isCurrentlyLocked = lockoutTime > 0
  
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      {/* Botao voltar para home - fixo no canto superior esquerdo */}
      <div className="fixed left-4 top-4 z-50">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2">
            <Home className="size-4" />
            Voltar ao Site
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Acesso Restrito
          </h1>
          <p className="mt-2 text-muted-foreground">
            Guia Exam02 - Complete o exame de C para acessar
          </p>
        </div>
        
        {/* Lockout Warning */}
        {isCurrentlyLocked && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-4 p-4">
              <Clock className="size-8 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Acesso Bloqueado</p>
                <p className="text-sm text-muted-foreground">
                  Muitas tentativas falhas. Tente novamente em{" "}
                  <span className="font-mono font-bold text-destructive">
                    {formatTimeRemaining(lockoutTime)}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Main Content */}
        {mode === "locked" && !isCurrentlyLocked && (
          <div className="flex flex-col gap-4">
            <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md" onClick={() => setMode("exam")}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Code2 className="size-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Fazer Exame de C</h3>
                  <p className="text-sm text-muted-foreground">
                    Responda corretamente 80% das perguntas sobre linguagem C
                  </p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md" onClick={() => setMode("admin")}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-lg bg-warning/10">
                  <Key className="size-6 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Acesso de Administrador</h3>
                  <p className="text-sm text-muted-foreground">
                    Entre com credenciais de admin (apenas para administradores)
                  </p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
            
            {attempts > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                <AlertTriangle className="mr-1 inline size-4 text-warning" />
                {getMaxAttempts() - attempts} tentativa(s) restante(s)
              </p>
            )}
          </div>
        )}
        
        {/* Admin Login */}
        {mode === "admin" && !isCurrentlyLocked && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-warning" />
                Acesso de Administrador
              </CardTitle>
              <CardDescription>
                Digite suas credenciais de administrador
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Usuario
                </label>
                <Input
                  type="text"
                  placeholder="Digite seu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                />
              </div>
              
              {adminError && (
                <p className="text-sm text-destructive">{adminError}</p>
              )}
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setMode("locked")} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleAdminLogin} className="flex-1">
                  Entrar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Exam Mode */}
        {mode === "exam" && !isCurrentlyLocked && (
          <ExamQuestionCard
            question={examQuestions[currentQuestion]}
            questionIndex={currentQuestion}
            totalQuestions={examQuestions.length}
            selectedAnswer={selectedAnswers[examQuestions[currentQuestion].id]}
            showExplanation={showExplanation}
            onSelectAnswer={(index) => handleSelectAnswer(examQuestions[currentQuestion].id, index)}
            onShowExplanation={() => setShowExplanation(true)}
            onNext={handleNextQuestion}
            onBack={() => setMode("locked")}
          />
        )}
        
        {/* Result Mode */}
        {mode === "result" && examResult && (
          <Card>
            <CardContent className="p-8 text-center">
              {examResult.passed ? (
                <>
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="size-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Parabens!</h2>
                  <p className="mt-2 text-muted-foreground">
                    Voce acertou {examResult.score} de {examQuestions.length} perguntas.
                    Acesso liberado!
                  </p>
                  <Button onClick={() => setHasAccess(true)} className="mt-6">
                    Acessar Guia Exam02
                  </Button>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                    <XCircle className="size-8 text-destructive" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Nao foi desta vez</h2>
                  <p className="mt-2 text-muted-foreground">
                    Voce acertou {examResult.score} de {examQuestions.length} perguntas.
                    Precisa de pelo menos {Math.ceil(examQuestions.length * 0.8)} acertos.
                  </p>
                  
                  {isCurrentlyLocked ? (
                    <p className="mt-4 text-sm text-destructive">
                      <Clock className="mr-1 inline size-4" />
                      Aguarde {formatTimeRemaining(lockoutTime)} para tentar novamente.
                    </p>
                  ) : (
                    <div className="mt-6 flex justify-center gap-3">
                      <Button variant="outline" onClick={() => setMode("locked")}>
                        Voltar
                      </Button>
                      <Button onClick={handleRetryExam}>
                        Tentar Novamente ({getMaxAttempts() - attempts} restante{getMaxAttempts() - attempts !== 1 ? "s" : ""})
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Componente de pergunta do exame
interface ExamQuestionCardProps {
  question: ExamQuestion
  questionIndex: number
  totalQuestions: number
  selectedAnswer?: number
  showExplanation: boolean
  onSelectAnswer: (index: number) => void
  onShowExplanation: () => void
  onNext: () => void
  onBack: () => void
}

function ExamQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  showExplanation,
  onSelectAnswer,
  onShowExplanation,
  onNext,
  onBack
}: ExamQuestionCardProps) {
  const hasAnswered = selectedAnswer !== undefined
  const isCorrect = selectedAnswer === question.correctAnswer
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pergunta {questionIndex + 1}/{totalQuestions}</CardTitle>
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "size-2 rounded-full",
                  i === questionIndex ? "bg-primary" : i < questionIndex ? "bg-primary/50" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="font-medium text-foreground">{question.question}</p>
        
        {question.code && (
          <pre className="overflow-x-auto rounded-lg bg-terminal p-4 font-mono text-sm text-terminal-foreground">
            <code>{question.code}</code>
          </pre>
        )}
        
        <div className="flex flex-col gap-2">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrectOption = index === question.correctAnswer
            
            return (
              <button
                key={index}
                onClick={() => !showExplanation && onSelectAnswer(index)}
                disabled={showExplanation}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                  showExplanation && isCorrectOption && "border-primary bg-primary/10",
                  showExplanation && isSelected && !isCorrectOption && "border-destructive bg-destructive/10",
                  !showExplanation && isSelected && "border-primary bg-primary/5",
                  !showExplanation && !isSelected && "border-border hover:border-primary/50"
                )}
              >
                <span className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-sm font-medium",
                  showExplanation && isCorrectOption && "border-primary bg-primary text-primary-foreground",
                  showExplanation && isSelected && !isCorrectOption && "border-destructive bg-destructive text-destructive-foreground",
                  !showExplanation && isSelected && "border-primary bg-primary text-primary-foreground",
                  !showExplanation && !isSelected && "border-muted-foreground/50"
                )}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-sm">{option}</span>
                {showExplanation && isCorrectOption && (
                  <CheckCircle className="size-5 text-primary" />
                )}
                {showExplanation && isSelected && !isCorrectOption && (
                  <XCircle className="size-5 text-destructive" />
                )}
              </button>
            )
          })}
        </div>
        
        {showExplanation && (
          <div className="rounded-lg bg-primary/5 p-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold text-primary">Explicacao:</span>{" "}
              {question.explanation}
            </p>
          </div>
        )}
        
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          {!showExplanation ? (
            <Button 
              onClick={onShowExplanation} 
              disabled={!hasAnswered}
              className="flex-1"
            >
              Verificar Resposta
            </Button>
          ) : (
            <Button onClick={onNext} className="flex-1">
              {questionIndex < totalQuestions - 1 ? "Proxima Pergunta" : "Ver Resultado"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
