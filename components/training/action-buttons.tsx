"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Lightbulb,
  Eye,
  BrainCircuit,
  Trash2,
  ListChecks,
  RotateCcw,
  FileCode2,
} from "lucide-react"

interface ActionButtonsProps {
  onHint: () => void
  onSolution: () => void
  onCheck: () => void
  onClear: () => void
  onExplanation: () => void
  onReset: () => void
  onViewCode: () => void
  disabled: boolean
}

export function ActionButtons({
  onHint,
  onSolution,
  onCheck,
  onClear,
  onExplanation,
  onReset,
  onViewCode,
  disabled,
}: ActionButtonsProps) {
  const buttons = [
    {
      label: "Dica",
      icon: Lightbulb,
      onClick: onHint,
      variant: "secondary" as const,
    },
    {
      label: "Solucao",
      icon: Eye,
      onClick: onSolution,
      variant: "secondary" as const,
    },
    {
      label: "Explicacao",
      icon: ListChecks,
      onClick: onExplanation,
      variant: "secondary" as const,
    },
    {
      label: "Ver Codigo",
      icon: FileCode2,
      onClick: onViewCode,
      variant: "secondary" as const,
    },
    {
      label: "Verificar",
      icon: BrainCircuit,
      onClick: onCheck,
      variant: "default" as const,
    },
    {
      label: "Resetar",
      icon: RotateCcw,
      onClick: onReset,
      variant: "outline" as const,
    },
    {
      label: "Limpar",
      icon: Trash2,
      onClick: onClear,
      variant: "outline" as const,
    },
  ]

  return (
    <div className="flex flex-wrap gap-1.5 md:gap-2">
      {buttons.map((btn) => (
        <Tooltip key={btn.label}>
          <TooltipTrigger asChild>
            <Button
              variant={btn.variant}
              size="sm"
              onClick={btn.onClick}
              disabled={disabled}
              className="h-8 gap-1 px-2 text-[11px] md:h-9 md:gap-1.5 md:px-3 md:text-xs"
            >
              <btn.icon className="size-3 md:size-3.5" />
              <span>{btn.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{btn.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
