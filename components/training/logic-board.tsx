"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LogicBoardProps {
  exerciseId: number
  className?: string
}

const STORAGE_KEY = "treino_pro_logic_board"

type StoredBoards = Record<number, string>

export function LogicBoard({ exerciseId, className }: LogicBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Ajusta tamanho do canvas para o container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = 2
      ctx.strokeStyle = "rgba(248, 250, 252, 0.9)"
    }

    // Recarrega o desenho salvo após resize
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as StoredBoards
      const dataUrl = data[exerciseId]
      if (!dataUrl) return
      const img = new Image()
      img.onload = () => {
        if (!canvasRef.current || !canvasRef.current.getContext) return
        const c = canvasRef.current
        const ctx2 = c.getContext("2d")
        if (!ctx2) return
        ctx2.drawImage(img, 0, 0, c.width / dpr, c.height / dpr)
      }
      img.src = dataUrl
    } catch {
      // ignora erro de parse
    }
  }, [exerciseId])

  useEffect(() => {
    if (typeof window === "undefined") return
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [resizeCanvas])

  const getCtx = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext("2d")
  }

  const saveBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === "undefined") return
    try {
      const dataUrl = canvas.toDataURL("image/png")
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed: StoredBoards = raw ? JSON.parse(raw) : {}
      parsed[exerciseId] = dataUrl
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    } catch {
      // ignore quota / serialization errors
    }
  }, [exerciseId])

  const handlePointerDown = (
    e: React.PointerEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = getCtx()
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setIsDrawing(true)
  }

  const handlePointerMove = (
    e: React.PointerEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = getCtx()
    if (!ctx) return
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const endDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    saveBoard()
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    saveBoard()
  }

  return (
    <div
      className={cn(
        "mt-1 flex flex-col gap-1.5 rounded-lg border border-border bg-card/80 p-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            Lousa de lógica
          </span>
          <span className="hidden text-[10px] text-muted-foreground md:inline">
            Desenhe fluxos, diagramas, setas e ideias
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[10px]"
            onClick={handleClear}
          >
            Limpar lousa
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[10px]"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? "Mostrar" : "Recolher"}
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div
          ref={containerRef}
          className="relative mt-1 h-40 w-full overflow-hidden rounded-md bg-slate-900/70"
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrawing}
            onPointerLeave={endDrawing}
          />
        </div>
      )}
    </div>
  )
}

