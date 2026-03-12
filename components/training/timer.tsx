"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react"

export function Timer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  const toggle = useCallback(() => setIsRunning((r) => !r), [])
  const reset = useCallback(() => {
    setSeconds(0)
    setIsRunning(true)
  }, [])

  const min = String(Math.floor(seconds / 60)).padStart(2, "0")
  const sec = String(seconds % 60).padStart(2, "0")

  return (
    <div className="flex items-center gap-2">
      <TimerIcon className="size-4 text-primary" />
      <span className="font-mono text-sm tabular-nums text-foreground">
        {min}:{sec}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={toggle}
        aria-label={isRunning ? "Pausar timer" : "Retomar timer"}
      >
        {isRunning ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={reset}
        aria-label="Resetar timer"
      >
        <RotateCcw className="size-3.5" />
      </Button>
    </div>
  )
}
