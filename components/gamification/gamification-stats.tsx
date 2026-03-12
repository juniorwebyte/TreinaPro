"use client"

import { cn } from "@/lib/utils"
import { type UserProfile } from "@/lib/gamification"
import { XPBar } from "./xp-bar"
import { StreakCard } from "./streak-card"
import { AchievementsPanel } from "./achievements-panel"
import { Ranking } from "./ranking"

interface GamificationStatsProps {
  profile: UserProfile
  className?: string
  variant?: "full" | "sidebar" | "header"
}

export function GamificationStats({
  profile,
  className,
  variant = "full",
}: GamificationStatsProps) {
  if (variant === "header") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <XPBar profile={profile} compact />
        <StreakCard profile={profile} compact />
        <AchievementsPanel profile={profile} compact />
      </div>
    )
  }

  if (variant === "sidebar") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <XPBar profile={profile} />
        <StreakCard profile={profile} />
        <AchievementsPanel profile={profile} />
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      <div className="flex flex-col gap-4">
        <XPBar profile={profile} />
        <StreakCard profile={profile} />
      </div>
      <div className="flex flex-col gap-4">
        <AchievementsPanel profile={profile} />
        <Ranking profile={profile} />
      </div>
    </div>
  )
}
