"use client"

import { useRef, useEffect, useCallback, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { Language } from "@/lib/exercises"
import {
  EDITOR_THEMES,
  loadEditorTheme,
  saveEditorTheme,
  getThemeById,
} from "@/lib/editor-themes"
import { generateHeader42 } from "@/lib/norminette"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Palette, Check } from "lucide-react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: Language
  className?: string
}

export function CodeEditor({
  value,
  onChange,
  language = "c",
  className,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const [themeId, setThemeId] = useState("dark")
  
  // Load theme on mount
  useEffect(() => {
    setThemeId(loadEditorTheme())
  }, [])
  
  const theme = useMemo(() => getThemeById(themeId), [themeId])
  
  const handleThemeChange = useCallback((newThemeId: string) => {
    setThemeId(newThemeId)
    saveEditorTheme(newThemeId)
  }, [])

  const lineCount = useMemo(() => {
    return value.split("\n").length
  }, [value])

  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 })

  const updateCursorPosition = useCallback(
    (text: string, position: number) => {
      const before = text.slice(0, position)
      const lines = before.split("\n")
      const line = lines.length
      const col = lines[lines.length - 1].length + 1
      setCursorPosition({ line, col })
    },
    [],
  )

  const syncScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.addEventListener("scroll", syncScroll)
    return () => textarea.removeEventListener("scroll", syncScroll)
  }, [syncScroll])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget

      // Explicit appending/Inserir Header 42 (Ctrl + Alt + H)
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "h") {
        if (language === "c") {
          e.preventDefault()
          if (value.includes("/* ****") && value.includes(":::      ::::::::   */")) {
            return
          }
          const header = generateHeader42("file.c")
          const withHeader = `${header}\n\n${value}`.trimStart() + "\n"
          onChange(withHeader)
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = header.length + 2
            updateCursorPosition(withHeader, textarea.selectionStart)
          })
          return
        }
      }

      if (e.key === "Tab") {
        e.preventDefault()
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const indent = language === "python" ? "    " : "\t"
        const newValue =
          value.substring(0, start) + indent + value.substring(end)
        onChange(newValue)
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd =
            start + indent.length
          updateCursorPosition(newValue, textarea.selectionEnd)
        })
        return
      }

      requestAnimationFrame(() => {
        updateCursorPosition(value, textarea.selectionStart)
      })
    },
    [value, onChange, language, updateCursorPosition],
  )

  const langLabel =
    language === "c"
      ? "C"
      : language === "shell"
      ? "Shell"
      : language === "python"
      ? "Python"
      : language === "javascript"
      ? "JavaScript"
      : language === "html"
      ? "HTML"
      : language === "css"
      ? "CSS"
      : language === "php"
      ? "PHP"
      : "Texto"

  const filename =
    language === "c"
      ? "main.c"
      : language === "shell"
      ? "script.sh"
      : "main.py"

  // Verificar se tem header 42 (apenas para C)
  const hasHeader42 = language === "c" && value.includes("/* ****") && value.includes(":::      ::::::::   */")

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-input",
        className,
      )}
      style={{ minHeight: 0 }}
    >
      {/* Editor header with VSCode-style tab */}
      <div className="flex items-center justify-between border-b border-border bg-slate-900 px-2 py-1 text-xs text-slate-300">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="ml-2 rounded-t-md border border-border bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-white shadow-sm">
            {filename}
          </span>
        </div>
        <span className="text-xs text-slate-400">{langLabel} • {lineCount} {lineCount === 1 ? "linha" : "linhas"}</span>
      </div>

      <div 
        className="flex items-center justify-between border-b px-3 py-1.5"
        style={{ 
          backgroundColor: theme.lineNumbersBg,
          borderColor: `${theme.lineNumbers}30`,
        }}
      >
        <div className="flex items-center gap-2">
          {language === "c" && (
            <span className={cn(
              "font-mono text-[9px] px-1.5 py-0.5 rounded",
              hasHeader42 
                ? "bg-success/20 text-success" 
                : "bg-destructive/20 text-destructive"
            )}>
              {hasHeader42 ? "Header 42 OK" : "Header 42 Faltando"}
            </span>
          )}
          <span className="font-mono text-[10px]" style={{ color: theme.lineNumbers }}>
            {cursorPosition.line}:{cursorPosition.col}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="font-mono text-[10px]"
            style={{ color: theme.lineNumbers }}
          >
            {value.length} chars
          </span>
          {/* Theme Picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 gap-1.5 px-2 text-[10px]"
                style={{ color: theme.lineNumbers }}
              >
                <Palette className="size-3" />
                <span className="hidden sm:inline">{theme.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {EDITOR_THEMES.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="size-3 rounded-sm border border-border"
                      style={{ backgroundColor: t.bg }}
                    />
                    <span className="text-xs">{t.name}</span>
                  </div>
                  {themeId === t.id && <Check className="size-3 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor body */}
      <div 
        className="relative flex min-h-0 flex-1"
        style={{ backgroundColor: theme.bg }}
      >
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="hidden select-none overflow-hidden border-r px-3 py-3 text-right font-mono text-xs leading-[1.625rem] md:block"
          style={{ 
            backgroundColor: theme.lineNumbersBg,
            borderColor: `${theme.lineNumbers}30`,
            color: theme.lineNumbers,
          }}
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            updateCursorPosition(e.target.value, e.target.selectionStart)
          }}
          onKeyDown={handleKeyDown}
          onClick={(e) => updateCursorPosition(value, e.currentTarget.selectionStart)}
          onKeyUp={(e) => updateCursorPosition(value, e.currentTarget.selectionStart)}
          onScroll={syncScroll}
          className="min-h-0 flex-1 resize-none overflow-auto bg-transparent p-3 font-mono text-sm leading-relaxed outline-none md:text-[13px] md:leading-[1.625rem]"
          placeholder={language === "c" 
            ? "// Escreva seu codigo aqui (Norminette ativada)..." 
            : "// Escreva seu codigo aqui..."}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          style={{ 
            tabSize: 4,
            color: theme.text,
            caretColor: theme.cursor,
          }}
        />
      </div>
    </div>
  )
}
