"use client"

import { cn } from "@/lib/utils"
import {
  type UserProfile,
  getXPForNextLevel,
  getXPForCurrentLevel,
  getLevelTitle,
} from "@/lib/gamification"
import { Zap } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface XPBarProps {
  profile: UserProfile
  className?: string
  compact?: boolean
}

export function XPBar({ profile, className, compact = false }: XPBarProps) {
  const currentLevelXP = getXPForCurrentLevel(profile.level)
  const nextLevelXP = getXPForNextLevel(profile.level)
  const progressXP = profile.xp - currentLevelXP
  const neededXP = nextLevelXP - currentLevelXP
  const progress = Math.min((progressXP / neededXP) * 100, 100)
  const title = getLevelTitle(profile.level)

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 cursor-default",
              className
            )}
          >
            <div className="flex size-6 items-center justify-center rounded-full bg-primary/20">
              <span className="text-xs font-bold text-primary">{profile.level}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-foreground">{title}</span>
              <div className="flex items-center gap-1">
                <Zap className="size-2.5 text-warning" />
                <span className="text-[9px] text-muted-foreground">
                  {profile.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{progressXP.toLocaleString()} / {neededXP.toLocaleString()} XP para nivel {profile.level + 1}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30">
            <span className="text-sm font-bold text-primary">{profile.level}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">{title}</span>
            <span className="text-[10px] text-muted-foreground">
              Nivel {profile.level}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="size-3.5 text-warning" />
          <span className="font-mono text-sm font-semibold text-foreground">
            {profile.xp.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">XP</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{progressXP.toLocaleString()} XP</span>
          <span>Nivel {profile.level + 1}: {neededXP.toLocaleString()} XP</span>
        </div>
      </div>
    </div>
  )
}
