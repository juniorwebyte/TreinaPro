"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  type UserProfile,
  generateLeaderboard,
  getLevelTitle,
} from "@/lib/gamification"
import { Trophy, Medal, Award, Crown, User } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RankingProps {
  profile: UserProfile
  className?: string
}

export function Ranking({ profile, className }: RankingProps) {
  const leaderboard = useMemo(() => {
    const bots = generateLeaderboard()
    // Inserir o usuário no ranking
    const allPlayers = [...bots, profile].sort((a, b) => b.xp - a.xp)
    return allPlayers.slice(0, 10)
  }, [profile])

  const userRank = useMemo(() => {
    const allPlayers = [...generateLeaderboard(), profile].sort((a, b) => b.xp - a.xp)
    return allPlayers.findIndex((p) => p.id === profile.id) + 1
  }, [profile])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="size-4 text-warning" />
      case 2:
        return <Medal className="size-4 text-[#C0C0C0]" />
      case 3:
        return <Award className="size-4 text-[#CD7F32]" />
      default:
        return <span className="text-xs font-bold text-muted-foreground">{rank}</span>
    }
  }

  const getRankBg = (rank: number, isUser: boolean) => {
    if (isUser) return "bg-primary/10 border-primary/30"
    switch (rank) {
      case 1:
        return "bg-warning/10 border-warning/30"
      case 2:
        return "bg-secondary border-border"
      case 3:
        return "bg-secondary border-border"
      default:
        return "bg-card border-border"
    }
  }

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Trophy className="size-4 text-warning" />
          Ranking
        </h3>
        <span className="text-xs text-muted-foreground">
          Sua posicao: #{userRank}
        </span>
      </div>

      <ScrollArea className="max-h-[300px]">
        <div className="flex flex-col gap-1.5">
          {leaderboard.map((player, index) => {
            const rank = index + 1
            const isUser = player.id === profile.id

            return (
              <div
                key={player.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                  getRankBg(rank, isUser),
                  isUser && "ring-1 ring-primary/50"
                )}
              >
                <div className="flex size-6 shrink-0 items-center justify-center">
                  {getRankIcon(rank)}
                </div>

                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  {isUser ? (
                    <User className="size-3.5 text-primary" />
                  ) : (
                    <span className="text-[10px] font-bold text-primary">
                      {player.level}
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={cn(
                    "truncate text-xs font-semibold",
                    isUser ? "text-primary" : "text-foreground"
                  )}>
                    {isUser ? "Voce" : player.username}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {getLevelTitle(player.level)} - Nivel {player.level}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {player.xp.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground">XP</span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {userRank > 10 && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-secondary/50 p-2">
          <User className="size-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Voce esta em <strong className="text-foreground">#{userRank}</strong> lugar
          </span>
        </div>
      )}
    </div>
  )
}
