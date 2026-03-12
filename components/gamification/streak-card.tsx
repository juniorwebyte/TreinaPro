"use client"

import { cn } from "@/lib/utils"
import { type UserProfile } from "@/lib/gamification"
import { Flame, Trophy, Calendar } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StreakCardProps {
  profile: UserProfile
  className?: string
  compact?: boolean
}

export function StreakCard({ profile, className, compact = false }: StreakCardProps) {
  const isActive = profile.streak > 0
  const streakLevel = profile.streak >= 30 ? "legendary" : profile.streak >= 14 ? "epic" : profile.streak >= 7 ? "rare" : "common"
  
  const streakColors = {
    common: "text-warning",
    rare: "text-primary",
    epic: "text-accent",
    legendary: "text-destructive",
  }

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 cursor-default",
              className
            )}
          >
            <Flame className={cn("size-4", isActive ? streakColors[streakLevel] : "text-muted-foreground")} />
            <span className={cn(
              "font-mono text-sm font-bold",
              isActive ? streakColors[streakLevel] : "text-muted-foreground"
            )}>
              {profile.streak}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{profile.streak} {profile.streak === 1 ? "dia" : "dias"} consecutivos</p>
          <p className="text-muted-foreground">Recorde: {profile.bestStreak} dias</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Flame className={cn("size-4", streakColors[streakLevel])} />
          Sequencia de Estudo
        </h3>
        {isActive && (
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            streakLevel === "legendary" ? "bg-destructive/20 text-destructive" :
            streakLevel === "epic" ? "bg-accent/20 text-accent" :
            streakLevel === "rare" ? "bg-primary/20 text-primary" :
            "bg-warning/20 text-warning"
          )}>
            {streakLevel === "legendary" ? "Lendario!" :
             streakLevel === "epic" ? "Epico!" :
             streakLevel === "rare" ? "Raro!" : "Ativo"}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-1">
        <Flame className={cn(
          "size-8",
          isActive ? streakColors[streakLevel] : "text-muted-foreground/30"
        )} />
        <span className={cn(
          "font-mono text-4xl font-bold",
          isActive ? streakColors[streakLevel] : "text-muted-foreground/30"
        )}>
          {profile.streak}
        </span>
        <span className="ml-1 text-sm text-muted-foreground">
          {profile.streak === 1 ? "dia" : "dias"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Trophy className="size-3.5 text-warning" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground">Melhor sequencia</span>
            <span className="font-mono text-xs font-semibold text-foreground">
              {profile.bestStreak} dias
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-primary" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground">Total exercicios</span>
            <span className="font-mono text-xs font-semibold text-foreground">
              {profile.totalExercises}
            </span>
          </div>
        </div>
      </div>

      {!isActive && (
        <p className="text-center text-xs text-muted-foreground">
          Complete um exercicio hoje para iniciar sua sequencia!
        </p>
      )}
    </div>
  )
}
