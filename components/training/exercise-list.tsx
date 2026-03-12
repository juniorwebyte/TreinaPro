"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  exercises,
  getExercisesByLanguage,
  getDifficultyLabel,
  getLanguageLabel,
  type Exercise,
  type Difficulty,
  type Language,
} from "@/lib/exercises"
import { CheckCircle2, Circle } from "lucide-react"

interface ExerciseListProps {
  selectedId: number | null
  completedIds: Set<number>
  onSelect: (exercise: Exercise) => void
  activeLanguage: Language
  onLanguageChange: (lang: Language) => void
  className?: string
}

const LANGUAGES: Language[] = ["c", "shell", "python"]

function DiffBadge({ diff }: { diff: Difficulty }) {
  const variants: Record<Difficulty, string> = {
    iniciante: "bg-success/15 text-success border-success/20",
    intermediario: "bg-warning/15 text-warning border-warning/20",
    avancado: "bg-destructive/15 text-destructive border-destructive/20",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
        variants[diff],
      )}
    >
      {getDifficultyLabel(diff)}
    </span>
  )
}

function LangBadge({ lang }: { lang: Language }) {
  const variants: Record<Language, string> = {
    c: "bg-primary/15 text-primary border-primary/20",
    shell: "bg-accent/15 text-accent border-accent/20",
    python: "bg-warning/15 text-warning border-warning/20",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
        variants[lang],
      )}
    >
      {getLanguageLabel(lang)}
    </span>
  )
}

export function ExerciseList({
  selectedId,
  completedIds,
  onSelect,
  activeLanguage,
  onLanguageChange,
  className,
}: ExerciseListProps) {
  const filteredExercises = getExercisesByLanguage(activeLanguage)
  const filteredCompleted = filteredExercises.filter((e) =>
    completedIds.has(e.id),
  ).length

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Language tabs */}
      <div className="flex gap-1 px-3 pb-3">
        {LANGUAGES.map((lang) => {
          const count = getExercisesByLanguage(lang).length
          const isActive = lang === activeLanguage
          return (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={cn(
                "flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="font-bold">{getLanguageLabel(lang)}</span>
              <span className="text-[10px] opacity-70">{count} ex.</span>
            </button>
          )
        })}
      </div>

      {/* Count header */}
      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-xs text-muted-foreground">
          {getLanguageLabel(activeLanguage)}
        </span>
        <Badge variant="secondary" className="text-[10px]">
          {filteredCompleted}/{filteredExercises.length}
        </Badge>
      </div>

      {/* List - use native scroll instead of ScrollArea for reliable flex behavior */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1 px-2 pb-4">
          {filteredExercises.map((ex) => {
            const isCompleted = completedIds.has(ex.id)
            const isSelected = selectedId === ex.id

            return (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                  "min-h-[44px] shrink-0",
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                aria-label={`Exercicio ${ex.title}${isCompleted ? ", concluido" : ""}`}
                aria-current={isSelected ? "true" : undefined}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                ) : (
                  <Circle className="size-4 shrink-0" />
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-mono text-sm font-medium">
                    {ex.title}
                  </span>
                  <div className="flex gap-1">
                    <DiffBadge diff={ex.difficulty} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
