"use client"

import Link from "next/link"
import { ArrowRight, TerminalSquare, CheckCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "./animated-section"
import { TerminalAnimation } from "@/components/ui/terminal-animation"

export function ExtensionSection() {
  return (
    <section id="extensao" className="relative overflow-hidden bg-background px-4 py-20 md:py-28 border-y border-border">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-semibold tracking-wider text-primary uppercase inline-flex items-center gap-2">
              <TerminalSquare className="size-4" />
              Potencialize Seu Editor
            </span>
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-5xl">
              Extensao Oficial Treino Pro
            </h2>
            <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Integramos as melhores ferramentas de avaliacao diretamente no seu Visual Studio Code.
              Nao saia do editor para revisar normas ou executar os testes da mini-moulinette.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimatedSection className="animation-delay-200">
            <div className="space-y-8">
              <div className="flex gap-4">
                 <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                   <TerminalSquare className="size-6 text-primary" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-foreground">Terminal Automático</h3>
                   <p className="mt-2 text-muted-foreground">Abra o terminal com o atalho webytehub e valide seus exercicios da 42 em poucos segundos com testes locais.</p>
                 </div>
              </div>
              
              <div className="flex gap-4">
                 <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                   <CheckCircle className="size-6 text-green-500" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-foreground">Correcao Rigorosa</h3>
                   <p className="mt-2 text-muted-foreground">Norminette executada em tempo-real no modulo e verificacao da sintaxe antes mesmo de voce compilar.</p>
                 </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link href="/vscode-extension">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    <Download className="size-4" />
                    Baixar Extensao
                  </Button>
                </Link>
                <Link href="/vscode-extension#documentacao">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                    Ler Documentacao
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection className="animation-delay-400">
             <div className="relative">
               {/* Decorative background bloom */}
               <div className="absolute inset-0 -z-10 bg-primary/20 blur-[100px] rounded-full" />
               <TerminalAnimation />
             </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
