"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DiffViewerProps {
  userCode: string
  solutionCode: string
  className?: string
}

interface DiffLine {
  type: "unchanged" | "added" | "removed" | "modified"
  userLine: string | null
  solutionLine: string | null
  lineNum: number
}

function computeDiff(userCode: string, solutionCode: string): DiffLine[] {
  const userLines = userCode.split("\n")
  const solutionLines = solutionCode.split("\n")
  const maxLines = Math.max(userLines.length, solutionLines.length)
  const diff: DiffLine[] = []

  for (let i = 0; i < maxLines; i++) {
    const userLine = userLines[i] ?? null
    const solutionLine = solutionLines[i] ?? null
    
    // Normalizar para comparacao (ignorar espacos extras)
    const normalizedUser = userLine?.replace(/\s+/g, " ").trim() ?? ""
    const normalizedSolution = solutionLine?.replace(/\s+/g, " ").trim() ?? ""

    let type: DiffLine["type"]
    
    if (userLine === null) {
      type = "added" // Linha existe so na solucao
    } else if (solutionLine === null) {
      type = "removed" // Linha existe so no codigo do usuario
    } else if (normalizedUser === normalizedSolution) {
      type = "unchanged"
    } else {
      type = "modified"
    }

    diff.push({
      type,
      userLine,
      solutionLine,
      lineNum: i + 1,
    })
  }

  return diff
}

export function DiffViewer({ userCode, solutionCode, className }: DiffViewerProps) {
  const diff = useMemo(() => computeDiff(userCode, solutionCode), [userCode, solutionCode])
  
  const stats = useMemo(() => {
    const unchanged = diff.filter((d) => d.type === "unchanged").length
    const modified = diff.filter((d) => d.type === "modified").length
    const added = diff.filter((d) => d.type === "added").length
    const removed = diff.filter((d) => d.type === "removed").length
    const total = diff.length
    const similarity = total > 0 ? Math.round((unchanged / total) * 100) : 0
    return { unchanged, modified, added, removed, total, similarity }
  }, [diff])

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg border border-border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-3 py-2">
        <span className="text-xs font-semibold text-foreground">Comparacao de Codigo</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-muted-foreground">
            Similaridade: <strong className="text-foreground">{stats.similarity}%</strong>
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-success" />
              {stats.unchanged}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-warning" />
              {stats.modified}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-primary" />
              {stats.added}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-destructive" />
              {stats.removed}
            </span>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 border-b border-border text-[10px]">
        <div className="border-r border-border bg-secondary/20 px-3 py-1 font-semibold text-muted-foreground">
          Seu Codigo
        </div>
        <div className="bg-secondary/20 px-3 py-1 font-semibold text-muted-foreground">
          Solucao de Referencia
        </div>
      </div>

      {/* Diff Content */}
      <ScrollArea className="max-h-[300px] flex-1">
        <div className="grid grid-cols-2">
          {/* User Code Column */}
          <div className="border-r border-border">
            {diff.map((line, idx) => (
              <DiffCodeLine
                key={`user-${idx}`}
                lineNum={line.lineNum}
                content={line.userLine}
                type={line.type === "removed" ? "removed" : line.type === "modified" ? "modified-old" : line.type}
                side="left"
              />
            ))}
          </div>

          {/* Solution Code Column */}
          <div>
            {diff.map((line, idx) => (
              <DiffCodeLine
                key={`solution-${idx}`}
                lineNum={line.lineNum}
                content={line.solutionLine}
                type={line.type === "added" ? "added" : line.type === "modified" ? "modified-new" : line.type}
                side="right"
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

function DiffCodeLine({
  lineNum,
  content,
  type,
  side,
}: {
  lineNum: number
  content: string | null
  type: "unchanged" | "added" | "removed" | "modified-old" | "modified-new" | "modified"
  side: "left" | "right"
}) {
  const bgColor = {
    unchanged: "",
    added: "bg-primary/10",
    removed: "bg-destructive/10",
    "modified-old": "bg-warning/10",
    "modified-new": "bg-warning/10",
    modified: "bg-warning/10",
  }[type]

  const textColor = {
    unchanged: "text-foreground/80",
    added: "text-primary",
    removed: "text-destructive",
    "modified-old": "text-warning",
    "modified-new": "text-warning",
    modified: "text-warning",
  }[type]

  const prefix = {
    unchanged: " ",
    added: "+",
    removed: "-",
    "modified-old": "~",
    "modified-new": "~",
    modified: "~",
  }[type]

  if (content === null) {
    return (
      <div className="flex h-6 items-center bg-secondary/20 px-1 text-[11px]">
        <span className="w-8 shrink-0 select-none pr-2 text-right text-muted-foreground/40">
          {lineNum}
        </span>
        <span className="text-muted-foreground/30">---</span>
      </div>
    )
  }

  return (
    <div className={cn("flex min-h-6 items-start px-1 font-mono text-[11px]", bgColor)}>
      <span className="w-8 shrink-0 select-none pr-2 pt-0.5 text-right text-muted-foreground/60">
        {lineNum}
      </span>
      <span className={cn("w-3 shrink-0 select-none pt-0.5", textColor)}>
        {prefix}
      </span>
      <pre className={cn("flex-1 whitespace-pre-wrap break-all pt-0.5", textColor)}>
        {content}
      </pre>
    </div>
  )
}
