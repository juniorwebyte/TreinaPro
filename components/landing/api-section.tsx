import { Code2, Server, Zap, Lock, Braces, FileJson } from "lucide-react"
import { AnimatedSection } from "./animated-section"

const API_FEATURES = [
  {
    icon: Zap,
    title: "Rapida e Leve",
    description:
      "API otimizada para respostas rapidas, ideal para integrar com apps, bots e ferramentas de estudo.",
  },
  {
    icon: Server,
    title: "RESTful",
    description:
      "Endpoints simples e documentados seguindo padroes REST para facil integracao.",
  },
  {
    icon: Lock,
    title: "Aberta",
    description:
      "Acesso livre para consulta de exercicios, solucoes e dados da plataforma.",
  },
]

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/exercises",
    description: "Lista todos os exercicios disponiveis",
  },
  {
    method: "GET",
    path: "/api/exercises?lang=c",
    description: "Filtra exercicios por linguagem (c, shell, python)",
  },
  {
    method: "GET",
    path: "/api/exercises/:id",
    description: "Retorna detalhes de um exercicio especifico",
  },
  {
    method: "GET",
    path: "/api/languages",
    description: "Lista as linguagens disponiveis e contagem de exercicios",
  },
]

export function ApiSection() {
  return (
    <section id="api" className="relative overflow-hidden px-4 py-20 md:py-28">
      {/* Floating icons */}
      <div className="pointer-events-none absolute top-16 left-6 animate-float text-primary/5 animation-delay-400">
        <Braces className="size-16 md:size-22" />
      </div>
      <div className="pointer-events-none absolute bottom-20 right-8 animate-float-reverse text-accent/5 animation-delay-800">
        <FileJson className="size-14 md:size-18" />
      </div>

      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-semibold tracking-wider text-primary uppercase">
              API
            </span>
            <h2 className="text-balance text-2xl font-bold text-foreground md:text-4xl">
              Integre com a API do Treino PRO
            </h2>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Acesse os exercicios, solucoes e dados da plataforma de forma
              programatica. Perfeito para bots, dashboards e ferramentas
              complementares.
            </p>
          </div>
        </AnimatedSection>

        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          {API_FEATURES.map((feature, i) => (
            <AnimatedSection key={feature.title} className={`animation-delay-${(i + 1) * 200}`}>
              <div className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="size-5 text-accent" />
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

        {/* Endpoints list */}
        <AnimatedSection>
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <Code2 className="size-5 text-primary" />
                <h3 className="font-mono text-sm font-semibold text-foreground">
                  Endpoints Disponiveis
                </h3>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {ENDPOINTS.map((endpoint) => (
                <div
                  key={endpoint.path}
                  className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-secondary/30 md:flex-row md:items-center md:gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex rounded-md bg-primary/15 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                      {endpoint.method}
                    </span>
                    <code className="font-mono text-sm text-foreground">
                      {endpoint.path}
                    </code>
                  </div>
                  <span className="text-xs text-muted-foreground md:ml-auto">
                    {endpoint.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Example response */}
        <AnimatedSection>
          <div className="mt-8 rounded-xl border border-border bg-terminal p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-destructive/60" />
                <div className="size-3 rounded-full bg-warning/60" />
                <div className="size-3 rounded-full bg-primary/60" />
              </div>
              <span className="ml-2 inline-flex rounded-md bg-primary/15 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                GET
              </span>
              <code className="font-mono text-sm text-terminal-foreground">
                /api/exercises?lang=c&limit=1
              </code>
            </div>
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-terminal-foreground">
              <code>{`{
  "data": [
    {
      "id": 1,
      "title": "ft_strlen",
      "language": "c",
      "difficulty": "iniciante",
      "description": "Implemente uma funcao que retorne o tamanho de uma string.",
      "tags": ["string", "loop", "ponteiro"]
    }
  ],
  "total": 10,
  "language": "c"
}`}</code>
            </pre>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
