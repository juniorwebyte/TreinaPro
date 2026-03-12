"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  type UserProfile,
  type Achievement,
  ACHIEVEMENTS,
  getUserAchievements,
  getLockedAchievements,
} from "@/lib/gamification"
import { Medal, Lock, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AchievementsPanelProps {
  profile: UserProfile
  className?: string
  compact?: boolean
}

export function AchievementsPanel({ profile, className, compact = false }: AchievementsPanelProps) {
  const [open, setOpen] = useState(false)
  const unlockedAchievements = getUserAchievements(profile)
  const lockedAchievements = getLockedAchievements(profile)
  const totalAchievements = ACHIEVEMENTS.length
  const progress = (unlockedAchievements.length / totalAchievements) * 100

  if (compact) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 transition-colors hover:bg-secondary",
              className
            )}
          >
            <Medal className="size-4 text-warning" />
            <span className="font-mono text-sm font-bold text-foreground">
              {unlockedAchievements.length}
            </span>
            <span className="text-[10px] text-muted-foreground">
              /{totalAchievements}
            </span>
          </button>
        </DialogTrigger>
        <AchievementsDialog
          unlockedAchievements={unlockedAchievements}
          lockedAchievements={lockedAchievements}
          progress={progress}
        />
      </Dialog>
    )
  }

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Medal className="size-4 text-warning" />
          Conquistas
        </h3>
        <span className="text-xs text-muted-foreground">
          {unlockedAchievements.length}/{totalAchievements}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-gradient-to-r from-warning to-warning/70 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {Math.round(progress)}% completado
        </span>
      </div>

      {/* Recent achievements */}
      <div className="flex flex-wrap gap-1.5">
        {unlockedAchievements.slice(0, 6).map((achievement) => (
          <Tooltip key={achievement.id}>
            <TooltipTrigger asChild>
              <div className="flex size-8 cursor-default items-center justify-center rounded-lg bg-warning/20 text-base">
                {achievement.icon}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p className="font-semibold">{achievement.title}</p>
              <p className="text-muted-foreground">{achievement.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {unlockedAchievements.length > 6 && (
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-[10px] font-medium text-muted-foreground">
            +{unlockedAchievements.length - 6}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full gap-2">
            Ver todas
            <ChevronRight className="size-3.5" />
          </Button>
        </DialogTrigger>
        <AchievementsDialog
          unlockedAchievements={unlockedAchievements}
          lockedAchievements={lockedAchievements}
          progress={progress}
        />
      </Dialog>
    </div>
  )
}

function AchievementsDialog({
  unlockedAchievements,
  lockedAchievements,
  progress,
}: {
  unlockedAchievements: Achievement[]
  lockedAchievements: Achievement[]
  progress: number
}) {
  const categories = [
    { id: "progress", label: "Progresso", icon: "📈" },
    { id: "streak", label: "Sequencia", icon: "🔥" },
    { id: "skill", label: "Habilidade", icon: "🧠" },
    { id: "special", label: "Especial", icon: "⭐" },
  ]

  return (
    <DialogContent className="max-h-[85vh] max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Medal className="size-5 text-warning" />
          Conquistas
        </DialogTitle>
        <DialogDescription>
          {unlockedAchievements.length} de {ACHIEVEMENTS.length} conquistadas ({Math.round(progress)}%)
        </DialogDescription>
      </DialogHeader>

      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-gradient-to-r from-warning to-warning/70 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ScrollArea className="max-h-[50vh] pr-4">
        <div className="flex flex-col gap-6">
          {categories.map((category) => {
            const unlocked = unlockedAchievements.filter((a) => a.category === category.id)
            const locked = lockedAchievements.filter((a) => a.category === category.id)

            return (
              <div key={category.id} className="flex flex-col gap-2">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>{category.icon}</span>
                  {category.label}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {unlocked.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} unlocked />
                  ))}
                  {locked.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} unlocked={false} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </DialogContent>
  )
}

function AchievementCard({
  achievement,
  unlocked,
}: {
  achievement: Achievement
  unlocked: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2.5 transition-colors",
        unlocked
          ? "border-warning/30 bg-warning/5"
          : "border-border bg-secondary/30 opacity-60"
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg text-lg",
          unlocked ? "bg-warning/20" : "bg-secondary"
        )}
      >
        {unlocked ? achievement.icon : <Lock className="size-4 text-muted-foreground" />}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className={cn(
          "truncate text-xs font-semibold",
          unlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {achievement.title}
        </span>
        <span className="truncate text-[10px] text-muted-foreground">
          {achievement.description}
        </span>
      </div>
    </div>
  )
}
