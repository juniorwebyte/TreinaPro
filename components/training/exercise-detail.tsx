"use client"

import { Badge } from "@/components/ui/badge"
import {
  type Exercise,
  getDifficultyLabel,
  getLanguageLabel,
  type Difficulty,
  type Language,
} from "@/lib/exercises"
import { BookOpen, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExerciseDetailProps {
  exercise: Exercise
}

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

export function ExerciseDetail({ exercise }: ExerciseDetailProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-mono text-lg font-bold text-foreground">
          {exercise.title}
        </h2>
        <LangBadge lang={exercise.language} />
        <DiffBadge diff={exercise.difficulty} />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {exercise.description}
      </p>

      {/* Concept section */}
      <div className="flex flex-col gap-1.5 rounded-md bg-secondary/50 p-3">
        <div className="flex items-center gap-1.5">
          <BookOpen className="size-3.5 text-accent" />
          <span className="text-xs font-semibold text-accent">Conceito</span>
        </div>
        <p className="text-xs leading-relaxed text-foreground/80">
          {exercise.concept}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag className="size-3 text-muted-foreground" />
        {exercise.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="px-1.5 py-0 text-[10px]"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}
