"use client"

import { Progress } from "@/components/ui/progress"
import { exercises, getExercisesByLanguage, getLanguageLabel, type Language } from "@/lib/exercises"
import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressTrackerProps {
  completedIds: Set<number>
  activeLanguage: Language
  className?: string
}

export function ProgressTracker({
  completedIds,
  activeLanguage,
  className,
}: ProgressTrackerProps) {
  const totalAll = exercises.length
  const doneAll = completedIds.size
  const percentAll = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0

  const langExercises = getExercisesByLanguage(activeLanguage)
  const langDone = langExercises.filter((e) => completedIds.has(e.id)).length
  const langPercent =
    langExercises.length > 0
      ? Math.round((langDone / langExercises.length) * 100)
      : 0

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-3",
        className,
      )}
    >
      {/* Overall */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Geral
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {doneAll}/{totalAll} ({percentAll}%)
          </span>
        </div>
        <Progress value={percentAll} className="h-1.5 bg-secondary" />
      </div>

      {/* Current language */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {getLanguageLabel(activeLanguage)}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {langDone}/{langExercises.length} ({langPercent}%)
          </span>
        </div>
        <Progress value={langPercent} className="h-1.5 bg-secondary" />
      </div>

      {percentAll === 100 && (
        <p className="text-center text-xs font-medium text-success">
          Parabens! Todos os exercicios foram concluidos!
        </p>
      )}
    </div>
  )
}
