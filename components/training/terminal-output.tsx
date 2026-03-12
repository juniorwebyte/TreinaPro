"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Terminal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export type OutputType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "hint"
  | "explanation"
  | "command"
  | "separator"

export interface OutputMessage {
  type: OutputType
  text: string
  timestamp?: string
}

interface TerminalOutputProps {
  messages: OutputMessage[]
  onClear?: () => void
  className?: string
}

function getTypeStyles(type: OutputType) {
  switch (type) {
    case "success":
      return "text-success"
    case "warning":
      return "text-warning"
    case "error":
      return "text-destructive"
    case "hint":
      return "text-accent"
    case "explanation":
      return "text-foreground"
    case "command":
      return "text-primary font-bold"
    case "separator":
      return "text-border"
    default:
      return "text-muted-foreground"
  }
}

function getTypePrefix(type: OutputType) {
  switch (type) {
    case "success":
      return "[OK]"
    case "warning":
      return "[WARN]"
    case "error":
      return "[ERR]"
    case "hint":
      return "[DICA]"
    case "explanation":
      return "[INFO]"
    case "command":
      return ">"
    case "separator":
      return ""
    default:
      return "$"
  }
}

export function TerminalOutput({
  messages,
  onClear,
  className,
}: TerminalOutputProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-terminal",
        className,
      )}
      style={{ minHeight: 0 }}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-3 py-2">
        <Terminal className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Terminal</span>
        <span className="ml-1 font-mono text-[10px] text-muted-foreground/60">
          ({messages.length} {messages.length === 1 ? "msg" : "msgs"})
        </span>
        <div className="ml-auto flex items-center gap-2">
          {onClear && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={onClear}
              aria-label="Limpar terminal"
            >
              <Trash2 className="size-3" />
            </Button>
          )}
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-destructive/60" />
            <div className="size-2.5 rounded-full bg-warning/60" />
            <div className="size-2.5 rounded-full bg-success/60" />
          </div>
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed md:text-[13px]"
      >
        {messages.map((msg, i) =>
          msg.type === "separator" ? (
            <div
              key={i}
              className="my-1 border-t border-border/40"
              aria-hidden="true"
            />
          ) : (
            <div key={i} className="flex gap-2">
              <span
                className={cn(
                  "shrink-0 font-bold",
                  getTypeStyles(msg.type),
                )}
              >
                {getTypePrefix(msg.type)}
              </span>
              <span
                className={cn(
                  getTypeStyles(msg.type),
                  msg.type === "info" && "text-terminal-foreground",
                )}
              >
                {msg.text}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
