"use client"

import { Braces, Terminal, Code2, CheckCircle2, FileCode, Hash, Variable, Globe, Palette, FileJson, Server } from "lucide-react"
import { AnimatedSection } from "./animated-section"
import { getExercisesByLanguage } from "@/lib/exercises"

const LANGUAGES = [
  {
    name: "C",
    icon: Braces,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    hoverBorder: "hover:border-primary/50",
    glowColor: "hover:shadow-primary/10",
    exercises: getExercisesByLanguage("c").length,
    description:
      "A base de tudo na Piscine. Domine ponteiros, strings, memoria dinamica e funcoes fundamentais usadas nos projetos da 42.",
    topics: [
      "ft_strlen, ft_swap, ft_putstr",
      "ft_strcmp, ft_atoi, ft_strcpy",
      "ft_strdup, ft_range",
      "Ponteiros e memoria",
      "Write e file descriptors",
      "Recursao (ft_putnbr)",
    ],
  },
  {
    name: "Shell",
    icon: Terminal,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
    hoverBorder: "hover:border-accent/50",
    glowColor: "hover:shadow-accent/10",
    exercises: getExercisesByLanguage("shell").length,
    description:
      "Aprenda a navegar, manipular arquivos e automatizar tarefas no terminal. Essencial para sobreviver na Piscine.",
    topics: [
      "Listar e ordenar arquivos",
      "Contar linhas com wc",
      "Buscar padroes com grep",
      "Permissoes com chmod",
      "Renomear em lote com mv",
    ],
  },
  {
    name: "Python",
    icon: Code2,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    hoverBorder: "hover:border-warning/50",
    glowColor: "hover:shadow-warning/10",
    exercises: getExercisesByLanguage("python").length,
    description:
      "Logica de programacao com Python. FizzBuzz, Fibonacci, ordenacao e manipulacao de strings preparam voce para pensar como programador.",
    topics: [
      "Inverter string sem slicing",
      "FizzBuzz classico",
      "Sequencia de Fibonacci",
      "Bubble Sort",
      "Contador de palavras",
      "Verificar palindromo",
    ],
  },
  {
    name: "HTML",
    icon: Globe,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    hoverBorder: "hover:border-orange-500/50",
    glowColor: "hover:shadow-orange-500/10",
    exercises: getExercisesByLanguage("html").length,
    description:
      "A linguagem de marcacao da web. Aprenda a estruturar paginas com semantica correta, acessibilidade e boas praticas modernas.",
    topics: [
      "Estrutura basica de um documento",
      "Tags semanticas (header, main, footer)",
      "Formularios e validacao nativa",
      "Tabelas e listas",
      "Imagens, audio e video",
      "Meta tags e SEO basico",
    ],
  },
  {
    name: "CSS",
    icon: Palette,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/50",
    glowColor: "hover:shadow-blue-500/10",
    exercises: getExercisesByLanguage("css").length,
    description:
      "Estilize suas paginas com CSS moderno. Flexbox, Grid, animacoes e design responsivo para criar interfaces profissionais.",
    topics: [
      "Seletores e especificidade",
      "Flexbox e Grid Layout",
      "Design responsivo (media queries)",
      "Animacoes e transicoes",
      "Variaveis CSS (custom properties)",
      "Posicionamento e z-index",
    ],
  },
  {
    name: "JavaScript",
    icon: FileJson,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    hoverBorder: "hover:border-yellow-500/50",
    glowColor: "hover:shadow-yellow-500/10",
    exercises: getExercisesByLanguage("javascript").length,
    description:
      "A linguagem da web. Domine manipulacao do DOM, eventos, funcoes assincronas e logica de programacao com JavaScript moderno.",
    topics: [
      "Variaveis, tipos e operadores",
      "Funcoes e closures",
      "Manipulacao do DOM",
      "Eventos e callbacks",
      "Promises e async/await",
      "Arrays (map, filter, reduce)",
    ],
  },
  {
    name: "PHP",
    icon: Server,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/20",
    hoverBorder: "hover:border-indigo-400/50",
    glowColor: "hover:shadow-indigo-400/10",
    exercises: getExercisesByLanguage("php").length,
    description:
      "Desenvolvimento backend com PHP. Aprenda a criar APIs, conectar com bancos de dados e construir aplicacoes web dinamicas.",
    topics: [
      "Sintaxe basica e variaveis",
      "Arrays e funcoes",
      "Manipulacao de strings",
      "Conexao com MySQL (PDO)",
      "Formularios e requisicoes HTTP",
      "Sessoes e autenticacao basica",
    ],
  },
]

export function LanguagesSection() {
  return (
    <section id="linguagens" className="relative overflow-hidden px-4 py-20 md:py-28">
      {/* Floating decorative elements */}
      <div className="pointer-events-none absolute top-16 left-8 animate-float text-primary/5 animation-delay-200">
        <FileCode className="size-14 md:size-20" />
      </div>
      <div className="pointer-events-none absolute bottom-20 right-10 animate-float-reverse text-warning/5 animation-delay-600">
        <Hash className="size-12 md:size-18" />
      </div>
      <div className="pointer-events-none absolute top-1/3 right-4 animate-float-slow text-accent/5 animation-delay-1000">
        <Variable className="size-10 md:size-14" />
      </div>

      <div className="mx-auto max-w-7xl">
        <AnimatedSection>
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-semibold tracking-wider text-primary uppercase">
              Linguagens
            </span>
            <h2 className="text-balance text-2xl font-bold text-foreground md:text-4xl">
              Sete linguagens, uma preparacao completa
            </h2>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Desde os fundamentos da Piscine com C, Shell e Python ate
              desenvolvimento web completo com HTML, CSS, JavaScript e PHP.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {LANGUAGES.map((lang, i) => (
            <AnimatedSection key={lang.name} className={`animation-delay-${(i + 1) * 200}`}>
              <div
                className={`group flex h-full flex-col gap-5 rounded-xl border ${lang.borderColor} bg-card p-5 transition-all duration-300 ${lang.hoverBorder} hover:-translate-y-1 hover:shadow-lg ${lang.glowColor}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl ${lang.bgColor} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <lang.icon className={`size-6 ${lang.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {lang.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {lang.exercises} exercicios
                    </span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {lang.description}
                </p>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    Topicos abordados:
                  </span>
                  <ul className="flex flex-col gap-1.5">
                    {lang.topics.map((topic) => (
                      <li
                        key={topic}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2
                          className={`size-3.5 shrink-0 ${lang.color}`}
                        />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
