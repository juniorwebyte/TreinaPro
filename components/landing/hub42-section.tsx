"use client"

import {
  Users,
  GraduationCap,
  Globe,
  Clock,
  Lightbulb,
  Award,
  ExternalLink,
  Monitor,
  Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "./animated-section"

const PILLARS = [
  {
    icon: Users,
    title: "Peer-to-Peer",
    description:
      "Sem professores tradicionais. Voce aprende colaborando, revisando e sendo revisado por seus colegas.",
  },
  {
    icon: Lightbulb,
    title: "Aprender Fazendo",
    description:
      "Projetos praticos desde o primeiro dia. A pedagogia da 42 e baseada em resolver problemas reais.",
  },
  {
    icon: Clock,
    title: "Piscine Intensiva",
    description:
      "26 dias de imersao total em programacao. E o processo seletivo mais desafiador e transformador do Brasil.",
  },
  {
    icon: GraduationCap,
    title: "Gratuita",
    description:
      "A 42 e 100% gratuita, sem mensalidades ou taxas. O unico requisito e ter mais de 18 anos e paixao por aprender.",
  },
  {
    icon: Globe,
    title: "Rede Global",
    description:
      "Presente em mais de 30 paises, a 42 conecta voce a uma rede global de desenvolvedores e oportunidades.",
  },
  {
    icon: Award,
    title: "Reconhecimento",
    description:
      "Empresas de tecnologia reconhecem a formacao da 42 como referencia em resolucao de problemas e trabalho em equipe.",
  },
]

export function Hub42Section() {
  return (
    <section id="hub-42" className="relative overflow-hidden border-y border-border bg-card/50 px-4 py-20 md:py-28">
      {/* Floating decorative */}
      <div className="pointer-events-none absolute top-10 right-6 animate-float text-primary/5 animation-delay-200">
        <Monitor className="size-16 md:size-24" />
      </div>
      <div className="pointer-events-none absolute bottom-12 left-8 animate-float-reverse text-accent/5 animation-delay-600">
        <Workflow className="size-12 md:size-18" />
      </div>

      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-semibold tracking-wider text-primary uppercase">
              Hub 42
            </span>
            <h2 className="text-balance text-2xl font-bold text-foreground md:text-4xl">
              Conheca a Escola 42 Sao Paulo
            </h2>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              A 42 e uma escola de tecnologia inovadora, gratuita e sem
              professores. Fundada na Franca, chegou ao Brasil para transformar a
              educacao em programacao.
            </p>
            <a
              href="https://www.42sp.org.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2 mt-2">
                <Globe className="size-4" />
                Visitar site oficial da 42 SP
                <ExternalLink className="size-3" />
              </Button>
            </a>
          </div>
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <AnimatedSection key={pillar.title} className={`animation-delay-${(i % 3 + 1) * 200}`}>
              <div className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <pillar.icon className="size-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8">
            <div className="flex flex-col gap-4 text-center">
              <h3 className="text-lg font-bold text-foreground md:text-xl">
                Como funciona a Piscine?
              </h3>
              <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-4">
                {[
                  { step: "1", title: "Inscricao", desc: "Cadastre-se no site oficial da 42 SP" },
                  { step: "2", title: "Testes Online", desc: "Complete os jogos de logica e memoria" },
                  { step: "3", title: "Piscine", desc: "26 dias de imersao intensiva em C e Shell" },
                  { step: "4", title: "Selecao", desc: "Os melhores sao selecionados para o curso" },
                ].map((item) => (
                  <div key={item.step} className="flex flex-col items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {item.step}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {item.title}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
              <a
                href="https://www.42sp.org.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto mt-4"
              >
                <Button className="gap-2">
                  Inscreva-se na 42 SP
                  <ExternalLink className="size-3.5" />
                </Button>
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
