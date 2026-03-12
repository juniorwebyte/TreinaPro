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
  onInsertHeader: () => void
  onToggleSplit: () => void
  splitDirection: "horizontal" | "vertical"
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
  onInsertHeader,
  onToggleSplit,
  splitDirection,
  disabled,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between md:gap-2">
      {/* Grupo Apoio: Dica / Explicacao / Solucao */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {[
          {
            label: "Dica",
            icon: Lightbulb,
            onClick: onHint,
            variant: "secondary" as const,
            tooltip: "Mostra uma dica para destravar sem entregar a solucao.",
          },
          {
            label: "Explicacao",
            icon: ListChecks,
            onClick: onExplanation,
            variant: "secondary" as const,
            tooltip: "Explicacao passo a passo da logica do exercicio.",
          },
          {
            label: "Solucao",
            icon: Eye,
            onClick: onSolution,
            variant: "secondary" as const,
            tooltip: "Carrega a solucao completa no editor (use com responsabilidade!).",
          },
        ].map((btn) => (
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
              <p>{btn.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Grupo Correcao: Verificar / Limpar / Resetar */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {[
          {
            label: "Verificar",
            icon: BrainCircuit,
            onClick: onCheck,
            variant: "default" as const,
            tooltip: "Roda as verificacoes do exercicio no seu codigo.",
          },
          {
            label: "Limpar",
            icon: Trash2,
            onClick: onClear,
            variant: "outline" as const,
            tooltip: "Limpa totalmente o conteudo do editor.",
          },
          {
            label: "Resetar",
            icon: RotateCcw,
            onClick: onReset,
            variant: "outline" as const,
            tooltip: "Restaura o template original do exercicio.",
          },
        ].map((btn) => (
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
              <p>{btn.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Grupo Codigo/Layout: Ver Codigo / Header 42 / Split */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {[
          {
            label: "Ver Codigo",
            icon: FileCode2,
            onClick: onViewCode,
            variant: "secondary" as const,
            tooltip: "Abre a solucao de referencia em um modal para estudo.",
          },
          {
            label: "Header 42",
            icon: FileCode2,
            onClick: onInsertHeader,
            variant: "secondary" as const,
            tooltip: "Insere o header 42 automaticamente (atalho: Ctrl+Alt+H).",
          },
          {
            label: splitDirection === "horizontal" ? "Split Horizontal" : "Split Vertical",
            icon: FileCode2,
            onClick: onToggleSplit,
            variant: "secondary" as const,
            tooltip: "Alterna o layout entre editor/terminal lado a lado ou empilhados.",
          },
        ].map((btn) => (
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
              <p>{btn.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
