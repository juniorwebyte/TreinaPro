"use client"

import { useState } from "react"
import { Heart, Copy, Check, Coffee, BookOpen, Code2, Sparkles, Star, Zap, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "./animated-section"

// Chave PIX protegida - dividida para seguranca
const PIX_PARTS = ["119", "848", "018", "39"]
const getPixKey = () => PIX_PARTS.join("")
const PIX_KEY_MASKED = "119********39"

const REASONS = [
  {
    icon: Coffee,
    title: "Mantenha o Projeto Ativo",
    description: "Ajude a manter os servidores funcionando e o conteudo sempre atualizado e disponivel para todos.",
  },
  {
    icon: BookOpen,
    title: "Mais Exercicios",
    description: "Sua contribuicao permite a criacao de novos exercicios, linguagens e desafios para a comunidade.",
  },
  {
    icon: Code2,
    title: "Ferramentas Melhores",
    description: "Investimos em melhorar o editor, terminal e recursos da plataforma para uma experiencia ainda mais completa.",
  },
  {
    icon: Sparkles,
    title: "Educacao Acessivel",
    description: "O Treino PRO e e sempre sera gratuito. Sua doacao garante que mais pessoas tenham acesso a preparacao de qualidade.",
  },
]

export function SupportSection() {
  const [copied, setCopied] = useState(false)
  const [showPixKey, setShowPixKey] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(getPixKey()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  function handleTogglePixKey() {
    setShowPixKey(!showPixKey)
  }

  return (
    <section id="apoie" className="relative overflow-hidden px-4 py-20 md:py-28">
      {/* Floating decorative */}
      <div className="pointer-events-none absolute top-16 right-8 animate-float text-primary/5 animation-delay-200">
        <Heart className="size-16 md:size-24" />
      </div>
      <div className="pointer-events-none absolute bottom-20 left-6 animate-float-reverse text-warning/5 animation-delay-600">
        <Star className="size-14 md:size-20" />
      </div>
      <div className="pointer-events-none absolute top-1/2 left-4 animate-float-slow text-accent/5 animation-delay-1000">
        <Zap className="size-10 md:size-14" />
      </div>

      <div className="mx-auto max-w-5xl">
        <AnimatedSection>
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-semibold tracking-wider text-primary uppercase">
              Apoie o Projeto
            </span>
            <h2 className="text-balance text-2xl font-bold text-foreground md:text-4xl">
              Ajude a manter o Treino PRO vivo
            </h2>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              O Treino PRO e um projeto gratuito e open source. Se ele te ajudou
              na preparacao para a Piscine da 42, considere fazer uma doacao para
              que possamos continuar ajudando mais estudantes.
            </p>
          </div>
        </AnimatedSection>

        {/* PIX Card - Central highlight */}
        <AnimatedSection>
          <div className="mx-auto mb-16 max-w-lg">
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-card p-8 text-center shadow-lg shadow-primary/5">
              {/* Glow effect */}
              <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="size-8 text-primary" />
                </div>

                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Doe via PIX
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Qualquer valor faz a diferenca. Copie a chave PIX abaixo:
                </p>

                {/* PIX Key display */}
                <div className="mb-4 flex items-center justify-center gap-3 rounded-xl border border-border bg-secondary/50 px-6 py-4">
                  <span className="font-mono text-lg font-bold tracking-wider text-foreground md:text-xl">
                    {showPixKey ? getPixKey() : PIX_KEY_MASKED}
                  </span>
                  <button
                    onClick={handleTogglePixKey}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label={showPixKey ? "Ocultar chave PIX" : "Mostrar chave PIX"}
                  >
                    {showPixKey ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>

                <Button
                  onClick={handleCopy}
                  size="lg"
                  className={`w-full gap-2 text-base transition-all duration-300 ${
                    copied
                      ? "bg-primary/80 hover:bg-primary/80"
                      : ""
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="size-5" />
                      Chave PIX Copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="size-5" />
                      Copiar Chave PIX
                    </>
                  )}
                </Button>

                <p className="mt-4 text-xs text-muted-foreground">
                  Tipo: Telefone | Banco: Qualquer instituicao com PIX
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Reasons to support */}
        <div className="grid gap-6 sm:grid-cols-2">
          {REASONS.map((reason, i) => (
            <AnimatedSection key={reason.title} className={`animation-delay-${(i + 1) * 200}`}>
              <div className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <reason.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {reason.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center md:p-8">
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Agradecemos de coracao cada contribuicao. Juntos, podemos democratizar
              o acesso a educacao em tecnologia e ajudar mais pessoas a
              conquistarem seu lugar na 42 Sao Paulo.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
