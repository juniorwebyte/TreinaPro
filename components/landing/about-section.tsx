"use client"

import { Users, Target, BookOpen, Rocket, Code2, Terminal, Braces } from "lucide-react"
import { AnimatedSection } from "./animated-section"

const FEATURES = [
  {
    icon: Target,
    title: "Foco na Piscine",
    description:
      "Exercicios alinhados com o que voce vai encontrar na Piscine da 42 Sao Paulo, cobrindo desde conceitos basicos ate desafios avancados.",
  },
  {
    icon: BookOpen,
    title: "Aprendizado Guiado",
    description:
      "Cada exercicio possui conceito teorico, dicas progressivas, solucao comentada e explicacao passo a passo para garantir compreensao total.",
  },
  {
    icon: Rocket,
    title: "Pratica Interativa",
    description:
      "Editor de codigo integrado com terminal simulado, verificacao automatica e feedback instantaneo para acelerar seu aprendizado.",
  },
  {
    icon: Users,
    title: "Comunidade 42",
    description:
      "Desenvolvido por estudantes e entusiastas da 42, com conteudo atualizado e foco na metodologia peer-to-peer que a escola valoriza.",
  },
]

export function AboutSection() {
  return (
    <section id="quem-somos" className="relative overflow-hidden px-4 py-20 md:py-28">
      {/* Decorative floating code icons */}
      <div className="pointer-events-none absolute top-12 right-8 animate-float-slow text-primary/5">
        <Code2 className="size-16 md:size-24" />
      </div>
      <div className="pointer-events-none absolute bottom-16 left-6 animate-float text-accent/5 animation-delay-400">
        <Terminal className="size-14 md:size-20" />
      </div>
      <div className="pointer-events-none absolute top-1/2 right-4 animate-float-reverse text-warning/5 animation-delay-800">
        <Braces className="size-12 md:size-16" />
      </div>

      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-semibold tracking-wider text-primary uppercase">
              Quem Somos
            </span>
            <h2 className="text-balance text-2xl font-bold text-foreground md:text-4xl">
              Uma plataforma feita para quem quer conquistar a 42
            </h2>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              O Treino PRO nasceu da necessidade de uma ferramenta pratica e
              acessivel para preparar candidatos para a Piscine da 42 Sao Paulo.
              Acreditamos que a melhor forma de aprender programacao e praticando.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <AnimatedSection key={feature.title} className={`animation-delay-${(i + 1) * 200}`}>
              <div className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <div className="mt-16 rounded-xl border border-border bg-card p-8 md:p-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
              <div className="flex-1">
                <h3 className="mb-4 text-xl font-bold text-foreground md:text-2xl">
                  Nossa Missao
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  Democratizar o acesso ao conhecimento em programacao e preparar a
                  proxima geracao de desenvolvedores para os desafios da 42 Sao Paulo.
                  Queremos que cada candidato chegue na Piscine com confianca,
                  dominando os fundamentos de C, Shell e Python que serao exigidos.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-4 lg:w-64">
                <div className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary/70">
                  <span className="text-2xl font-bold text-primary">21+</span>
                  <span className="text-xs text-muted-foreground">
                    Exercicios interativos
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary/70">
                  <span className="text-2xl font-bold text-accent">3</span>
                  <span className="text-xs text-muted-foreground">
                    Linguagens de programacao
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-4 transition-colors hover:bg-secondary/70">
                  <span className="text-2xl font-bold text-warning">100%</span>
                  <span className="text-xs text-muted-foreground">
                    Gratuito e open source
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
