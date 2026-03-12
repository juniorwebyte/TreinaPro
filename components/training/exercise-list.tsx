"use client"

import { useMemo, useState } from "react"
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

const LANGUAGES: Language[] = ["c", "shell", "python", "javascript", "html", "css", "php"]

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
    javascript: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20",
    html: "bg-orange-500/15 text-orange-500 border-orange-500/20",
    css: "bg-blue-500/15 text-blue-500 border-blue-500/20",
    php: "bg-indigo-400/15 text-indigo-400 border-indigo-400/20",
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
  const [searchTerm, setSearchTerm] = useState("")
  const [tagFilter, setTagFilter] = useState("")

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    getExercisesByLanguage(activeLanguage).forEach((e) => {
      e.tags.forEach((t) => tags.add(t))
    })
    return Array.from(tags).sort()
  }, [activeLanguage])

  const filteredExercises = useMemo(() => {
    return getExercisesByLanguage(activeLanguage).filter((exercise) => {
      const term = searchTerm.trim().toLowerCase()
      const titleMatch = term === "" || exercise.title.toLowerCase().includes(term)
      const descriptionMatch = term === "" || exercise.description.toLowerCase().includes(term)
      const conceptMatch = term === "" || exercise.concept.toLowerCase().includes(term)
      const tagMatch =
        tagFilter === "" || exercise.tags.some((tag) => tag === tagFilter)

      return (titleMatch || descriptionMatch || conceptMatch) && tagMatch
    })
  }, [activeLanguage, searchTerm, tagFilter])

  const filteredCompleted = filteredExercises.filter((e) =>
    completedIds.has(e.id),
  ).length

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Count header and filters */}
      <div className="flex flex-col gap-2 px-4 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {getLanguageLabel(activeLanguage)}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {filteredCompleted}/{filteredExercises.length}
          </Badge>
        </div>

        <div className="flex gap-2">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar exercicio..."
            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
          />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="">Todas tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List - use native scroll instead of ScrollArea for reliable flex behavior */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1 px-2 pb-4">
          {filteredExercises.map((ex) => {
            const isCompleted = completedIds.has(ex.id)
            const isSelected = selectedId === ex.id
            const mainTag = ex.tags[0]

            return (
              <button
                key={ex.id}
                onClick={() => onSelect(ex)}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                  "min-h-[52px] shrink-0",
                  isSelected
                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/40"
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
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <span className="line-clamp-1 font-mono text-sm font-medium">
                    {ex.title}
                    </span>
                    <DiffBadge diff={ex.difficulty} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {mainTag && (
                      <span className="max-w-[120px] truncate rounded-full bg-secondary px-2 py-0.5">
                        {mainTag}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] opacity-70 group-hover:opacity-100">
                      #{ex.id}
                    </span>
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
