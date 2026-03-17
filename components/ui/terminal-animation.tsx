"use client"

import { useState, useEffect } from "react"

export const TerminalAnimation = () => {
  const [lines, setLines] = useState<{text: string, color?: string}[]>([])
  
  useEffect(() => {
    const sequence = [
      { text: "$ webytehub -42", delay: 800 },
      { text: "Executando Norminette...", delay: 1800, color: "text-cyan-400" },
      { text: "Norme: OK!", delay: 2200, color: "text-green-500" },
      { text: "Executando Mini-Moulinette...", delay: 3500, color: "text-cyan-400" },
      { text: "[OK] ft_putchar.c compila com sucesso", delay: 4200, color: "text-green-500" },
      { text: "✓ Teste 1: Passou", delay: 4600, color: "text-green-500" },
      { text: "✓ Teste 2: Passou", delay: 4900, color: "text-green-500" },
      { text: "Todos os testes passaram!", delay: 5200, color: "text-green-500 font-bold" },
      { text: "$ ", delay: 7000 }
    ]
    
    const timeoutIds: ReturnType<typeof setTimeout>[] = []
    
    const play = () => {
      setLines([])
      sequence.forEach((item) => {
        const id = setTimeout(() => {
          setLines((prev) => [...prev, item])
        }, item.delay)
        timeoutIds.push(id)
      })
      
      const resetId = setTimeout(play, 9500)
      timeoutIds.push(resetId)
    }
    
    play()
    
    return () => timeoutIds.forEach(clearTimeout)
  }, [])

  return (
    <div className="rounded-xl bg-[#1e1e1e] p-4 font-mono text-sm shadow-2xl min-h-[260px] border border-border relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-10 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-4">
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-red-500" />
          <div className="size-3 rounded-full bg-yellow-500" />
          <div className="size-3 rounded-full bg-green-500" />
        </div>
        <span className="mx-auto text-xs text-muted-foreground font-sans">Terminal Webytehub</span>
      </div>
      <div className="space-y-1.5 mt-10 text-[13px]">
        {lines.map((line, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
             {line.text.startsWith('$') ? (
                 <span><span className="text-green-500">$</span> {line.text.substring(2)}</span>
             ) : (
                 <span className={line.color || "text-foreground/90"}>{line.text}</span>
             )}
          </div>
        ))}
        <div className="inline-block w-2 bg-muted-foreground/60 animate-pulse ml-1 align-middle h-4" />
      </div>
    </div>
  )
}
