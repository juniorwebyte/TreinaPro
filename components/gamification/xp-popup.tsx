"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { type XPGain, type Achievement } from "@/lib/gamification"
import { Zap, Flame, Medal, ArrowUp, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface XPPopupProps {
  open: boolean
  onClose: () => void
  xpGain: XPGain | null
  newAchievements: Achievement[]
  leveledUp: boolean
  previousLevel: number
  newLevel: number
  streak: number
}

export function XPPopup({
  open,
  onClose,
  xpGain,
  newAchievements,
  leveledUp,
  previousLevel,
  newLevel,
  streak,
}: XPPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (open && (leveledUp || newAchievements.length > 0)) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [open, leveledUp, newAchievements.length])

  if (!xpGain) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm overflow-hidden">
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute left-1/4 top-0 animate-bounce text-2xl delay-100">
              <Sparkles className="text-warning" />
            </div>
            <div className="absolute right-1/4 top-0 animate-bounce text-2xl delay-300">
              <Sparkles className="text-primary" />
            </div>
            <div className="absolute left-1/3 top-4 animate-bounce text-2xl delay-500">
              <Sparkles className="text-accent" />
            </div>
          </div>
        )}

        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            {leveledUp ? (
              <>
                <ArrowUp className="size-6 text-success" />
                Nivel Aumentou!
              </>
            ) : (
              <>
                <Zap className="size-6 text-warning" />
                Exercicio Completo!
              </>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Resultado do exercicio completado
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {/* XP Gain */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Zap className="size-8 text-warning" />
              <span className="font-mono text-4xl font-bold text-warning">
                +{xpGain.total}
              </span>
              <span className="text-lg text-muted-foreground">XP</span>
            </div>

            {/* XP Breakdown */}
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                Base: +{xpGain.base}
              </span>
              {xpGain.bonusNoHint > 0 && (
                <span className="rounded-full bg-success/20 px-2 py-0.5 text-success">
                  Sem dica: +{xpGain.bonusNoHint}
                </span>
              )}
              {xpGain.bonusNoSolution > 0 && (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-primary">
                  Sem solucao: +{xpGain.bonusNoSolution}
                </span>
              )}
              {xpGain.streakMultiplier > 1 && (
                <span className="rounded-full bg-warning/20 px-2 py-0.5 text-warning">
                  Streak x{xpGain.streakMultiplier.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Level Up */}
          {leveledUp && (
            <div className="flex items-center gap-4 rounded-xl bg-success/10 px-6 py-3">
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground">Nivel</span>
                <span className="font-mono text-2xl font-bold text-muted-foreground">
                  {previousLevel}
                </span>
              </div>
              <ArrowUp className="size-6 text-success" />
              <div className="flex flex-col items-center">
                <span className="text-xs text-success">Novo!</span>
                <span className="font-mono text-2xl font-bold text-success">
                  {newLevel}
                </span>
              </div>
            </div>
          )}

          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-2">
              <Flame className="size-5 text-warning" />
              <span className="text-sm font-medium text-foreground">
                {streak} {streak === 1 ? "dia" : "dias"} consecutivos!
              </span>
            </div>
          )}

          {/* New Achievements */}
          {newAchievements.length > 0 && (
            <div className="flex w-full flex-col gap-2">
              <span className="flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground">
                <Medal className="size-3.5" />
                Nova{newAchievements.length > 1 ? "s" : ""} Conquista{newAchievements.length > 1 ? "s" : ""}!
              </span>
              <div className="flex flex-col gap-1.5">
                {newAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2"
                  >
                    <span className="text-xl">{achievement.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {achievement.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {achievement.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button onClick={onClose} className="w-full">
          Continuar
        </Button>
      </DialogContent>
    </Dialog>
  )
}
