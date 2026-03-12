"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  Download, 
  CheckCircle, 
  Terminal, 
  BookOpen, 
  GitBranch,
  Play,
  Settings,
  FileCode,
  Monitor,
  Lightbulb,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  AlertTriangle,
  Zap,
  Keyboard,
  FileText,
  Wrench,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FEATURES = [
  {
    icon: BookOpen,
    title: "Navegador de Exercicios",
    description: "Acesse todos os exercicios da Piscine diretamente na barra lateral do VSCode, organizados por modulo."
  },
  {
    icon: Terminal,
    title: "Norminette Integrada",
    description: "Verificacao automatica de estilo ao salvar arquivos .c e .h, com erros destacados no editor."
  },
  {
    icon: Play,
    title: "Compilar e Testar",
    description: "Compile e execute testes com um clique. Resultados exibidos diretamente no terminal integrado."
  },
  {
    icon: Lightbulb,
    title: "Dicas Contextuais",
    description: "Receba dicas para cada exercicio sem sair do VSCode. Ajuda quando voce precisar."
  },
  {
    icon: RefreshCw,
    title: "Sincronizacao",
    description: "Sincronize seu progresso com a plataforma web. Continue de onde parou em qualquer dispositivo."
  },
  {
    icon: GitBranch,
    title: "Integracao GitHub",
    description: "Envie seus exercicios diretamente para seu repositorio GitHub com commits formatados."
  }
]

const INSTALLATION_STEPS = [
  {
    step: 1,
    title: "Baixe a Extensao",
    description: "Clique no botao de download acima para baixar o arquivo .vsix da extensao."
  },
  {
    step: 2,
    title: "Abra o VSCode",
    description: "Abra o Visual Studio Code no seu computador."
  },
  {
    step: 3,
    title: "Instale a Extensao",
    description: "Pressione Ctrl+Shift+P (ou Cmd+Shift+P no Mac), digite 'Install from VSIX' e selecione o arquivo baixado."
  },
  {
    step: 4,
    title: "Reinicie o VSCode",
    description: "Reinicie o VSCode para ativar a extensao. O icone do Treino Pro aparecera na barra lateral."
  }
]

const SHORTCUTS = [
  { keys: "Ctrl+Shift+P", action: "Abrir painel de exercicios" },
  { keys: "Ctrl+Shift+N", action: "Verificar Norminette" },
  { keys: "Ctrl+Shift+T", action: "Compilar e testar" },
]

const COMMANDS = [
  {
    command: "treinoPro.openPanel",
    title: "Abrir Painel de Exercicios",
    description: "Abre o painel lateral com a lista de exercicios disponíveis organizados por modulo (C00-C07, Shell00-Shell01).",
    shortcut: "Ctrl+Shift+P"
  },
  {
    command: "treinoPro.loadExercise",
    title: "Carregar Exercicio",
    description: "Carrega um exercicio selecionado criando o arquivo template com o header 42 e a estrutura basica da funcao.",
    shortcut: null
  },
  {
    command: "treinoPro.runNorminette",
    title: "Verificar Norminette",
    description: "Executa a verificacao de estilo Norminette no arquivo atual. Erros sao destacados diretamente no editor com sublinhados e na aba de problemas.",
    shortcut: "Ctrl+Shift+N"
  },
  {
    command: "treinoPro.compileAndTest",
    title: "Compilar e Testar",
    description: "Compila o arquivo C atual com as flags -Wall -Wextra -Werror e executa os testes automatizados. Resultados aparecem no terminal integrado.",
    shortcut: "Ctrl+Shift+T"
  },
  {
    command: "treinoPro.submitExercise",
    title: "Enviar Exercicio",
    description: "Envia o exercicio para avaliacao na plataforma web. Requer que Norminette e testes estejam passando.",
    shortcut: null
  },
  {
    command: "treinoPro.showHint",
    title: "Mostrar Dica",
    description: "Exibe uma dica contextual para o exercicio atual sem revelar a solucao completa.",
    shortcut: null
  },
  {
    command: "treinoPro.syncProgress",
    title: "Sincronizar Progresso",
    description: "Sincroniza seu progresso local com a plataforma web. Permite continuar de onde parou em qualquer dispositivo.",
    shortcut: null
  },
  {
    command: "treinoPro.fixNormErrors",
    title: "Corrigir Erros de Norminette",
    description: "Aplica correcoes automaticas para erros comuns de Norminette como espacamento, indentacao e comprimento de linha.",
    shortcut: null
  },
  {
    command: "treinoPro.addHeader42",
    title: "Adicionar Header 42",
    description: "Insere o header padrao da 42 no inicio do arquivo com seu login e data.",
    shortcut: null
  },
  {
    command: "treinoPro.copilotFix",
    title: "Copilot - Corrigir com IA",
    description: "Usa o GitHub Copilot para sugerir correcoes para erros de Norminette ou compilacao.",
    shortcut: null
  },
  {
    command: "treinoPro.copilotExplain",
    title: "Copilot - Explicar Erro",
    description: "Usa o GitHub Copilot para explicar um erro selecionado e como corrigi-lo.",
    shortcut: null
  }
]

const NORMINETTE_RULES = [
  { rule: "Comprimento de linha", description: "Maximo 80 caracteres por linha" },
  { rule: "Funcoes por arquivo", description: "Maximo 5 funcoes por arquivo .c" },
  { rule: "Linhas por funcao", description: "Maximo 25 linhas por funcao" },
  { rule: "Variaveis por funcao", description: "Maximo 5 variaveis por funcao" },
  { rule: "Parametros de funcao", description: "Maximo 4 parametros por funcao" },
  { rule: "Indentacao", description: "Usar tabs (nao espacos)" },
  { rule: "Espacamento", description: "Espaco apos virgulas e operadores" },
  { rule: "Chaves", description: "Abrir na mesma linha, fechar em linha propria" },
]

export default function VSCodeExtensionPage() {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Baixar a extensao da API que gera o .vsix
      const response = await fetch('/api/download-extension')
      
      if (!response.ok) {
        throw new Error('Falha ao baixar extensao')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'treino-pro-v1.0.0.vsix'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar:', error)
      alert('Erro ao baixar a extensao. Por favor, tente novamente.')
    } finally {
      setDownloading(false)
    }
  }

  const copyCommand = () => {
    navigator.clipboard.writeText('code --install-extension treino-pro.vsix')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />
            <span className="text-sm font-medium">Voltar ao Site</span>
          </Link>
          <div className="flex items-center gap-2">
            <Image 
              src="/images/treino-pro-logo.png" 
              alt="Treino Pro" 
              width={28} 
              height={28}
              className="rounded"
            />
            <span className="font-semibold text-foreground">Extensao VSCode</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Hero Section */}
        <section className="mb-20 flex flex-col items-center gap-8 text-center">
          <Image 
            src="/images/treino-pro-logo.png" 
            alt="Treino Pro" 
            width={120} 
            height={120}
            className="rounded-lg"
          />

          
          <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Treino Pro para VSCode
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Extensão oficial do Treino Pro para VSCode. 
            Acesse exercícios, Norminette, testes automáticos e sincronização com a plataforma web.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button 
              size="lg" 
              className="gap-2 px-8"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <RefreshCw className="size-5 animate-spin" />
                  Preparando Download...
                </>
              ) : (
                <>
                  <Download className="size-5" />
                  Download v1.0.0
                </>
              )}
            </Button>
            
            <a 
              href="https://marketplace.visualstudio.com/items?itemName=treino-pro.treino-pro" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" className="gap-2">
                <ExternalLink className="size-4" />
                VS Marketplace
              </Button>
            </a>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Compativel com VSCode 1.85+ | Windows, macOS e Linux
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <a href="#documentacao" className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
              <FileText className="size-4" />
              Documentacao
            </a>
            <span className="text-muted-foreground/30">|</span>
            <a href="#como-instalar" className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
              <Download className="size-4" />
              Instalacao
            </a>
            <span className="text-muted-foreground/30">|</span>
            <a href="#recursos" className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
              <Zap className="size-4" />
              Recursos
            </a>
          </div>
        </section>

        {/* Preview Section */}
        <section className="mb-20">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Window Header */}
            <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/80" />
                <div className="size-3 rounded-full bg-yellow-500/80" />
                <div className="size-3 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-2 text-xs text-muted-foreground">Visual Studio Code — Treino Pro</span>
            </div>
            
            {/* Editor Preview */}
            <div className="flex min-h-[400px]">
              {/* Sidebar */}
              <div className="w-12 border-r border-border bg-secondary/30">
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileCode className="size-4" />
                  </div>
                  <div className="size-8 text-muted-foreground/50">
                    <Monitor className="size-4 mx-auto" />
                  </div>
                  <div className="size-8 text-muted-foreground/50">
                    <GitBranch className="size-4 mx-auto" />
                  </div>
                  <div className="mt-auto size-8 text-muted-foreground/50">
                    <Settings className="size-4 mx-auto" />
                  </div>
                </div>
              </div>
              
              {/* Sidebar Panel */}
              <div className="w-60 border-r border-border bg-card">
                <div className="p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="size-4 rounded-sm bg-green-600 flex items-center justify-center text-[10px] font-bold text-white">
                      TP
                    </div>
                    <span className="text-sm font-semibold">Treino Pro</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="rounded bg-secondary/50 px-2 py-1.5 text-xs font-medium">
                      Exercicios
                    </div>
                    <div className="space-y-0.5 pl-2">
                      <div className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-secondary/50">
                        <div className="size-3 rounded-full border border-green-500 bg-green-500/20" />
                        <span>C00</span>
                        <span className="ml-auto text-muted-foreground">5/5</span>
                      </div>
                      <div className="flex items-center gap-2 rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                        <div className="size-3 rounded-full border border-primary bg-primary/20" />
                        <span>C01</span>
                        <span className="ml-auto">3/8</span>
                      </div>
                      <div className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-secondary/50">
                        <div className="size-3 rounded-full border border-muted-foreground" />
                        <span>C02</span>
                        <span className="ml-auto text-muted-foreground">0/12</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-1">
                    <div className="rounded bg-secondary/50 px-2 py-1.5 text-xs font-medium">
                      Progresso
                    </div>
                    <div className="px-2 py-2">
                      <div className="mb-2 flex justify-between text-xs">
                        <span>Nivel</span>
                        <span className="text-primary">Intermediario</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full w-[35%] rounded-full bg-primary" />
                      </div>
                      <div className="mt-1 text-right text-xs text-muted-foreground">8/25 exercicios</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Editor Area */}
              <div className="flex-1 bg-background p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-secondary px-2 py-0.5">ft_swap.c</span>
                  <span className="text-green-500">Norminette: OK</span>
                </div>
                <pre className="font-mono text-xs leading-relaxed text-foreground/80">
{`/* ************************************************************************** */
/*                                                                            */
/*   ft_swap.c                                           :+:      :+:    :+:   */
/*                                                                            */
/* ************************************************************************** */

void    ft_swap(int *a, int *b)
{
    int    tmp;

    tmp = *a;
    *a = *b;
    *b = tmp;
}`}
                </pre>
                <div className="mt-4 rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-500">
                  <CheckCircle className="mr-2 inline size-3" />
                  Todos os 3 testes passaram!
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-20" id="recursos">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
            Recursos da Extensao
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <div 
                key={index}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Installation Steps */}
        <section className="mb-20" id="como-instalar">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
            Como Instalar
          </h2>
          
          <div className="mx-auto max-w-3xl">
            {/* Command Line Install */}
            <div className="mb-8 rounded-xl border border-border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Instalacao via Terminal (Recomendado)
              </h3>
              <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3">
                <Terminal className="size-4 text-muted-foreground" />
                <code className="flex-1 font-mono text-sm text-foreground">
                  code --install-extension treino-pro.vsix
                </code>
                <button
                  onClick={copyCommand}
                  className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>
            
            {/* Manual Steps */}
            <div className="space-y-4">
              {INSTALLATION_STEPS.map((item) => (
                <div 
                  key={item.step}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="mb-20">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground md:text-3xl">
            Atalhos de Teclado
          </h2>
          
          <div className="mx-auto max-w-md">
            <div className="overflow-hidden rounded-xl border border-border">
              {SHORTCUTS.map((shortcut, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center justify-between bg-card px-6 py-4",
                    index !== SHORTCUTS.length - 1 && "border-b border-border"
                  )}
                >
                  <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                  <kbd className="rounded bg-secondary px-3 py-1.5 font-mono text-xs font-semibold text-foreground">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documentation Section */}
        <section className="mb-20" id="documentacao">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
              Documentacao Completa
            </h2>
            <p className="text-muted-foreground">
              Guia completo de todos os comandos e funcionalidades da extensao
            </p>
          </div>

          {/* O que a extensao faz */}
          <div className="mb-12 rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Info className="size-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">O que a Extensao Faz</h3>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                A extensao <strong className="text-foreground">Treino Pro para VSCode</strong> foi desenvolvida 
                especificamente para estudantes que estao se preparando para a Piscine da 42 Sao Paulo. 
                Ela integra todas as ferramentas necessarias diretamente no seu editor de codigo.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <Terminal className="size-4 text-primary" />
                    Norminette Integrada
                  </h4>
                  <p className="text-sm">
                    Verifica automaticamente o estilo do seu codigo C conforme as regras da 42. 
                    Erros sao destacados em tempo real no editor, sem precisar abrir o terminal.
                  </p>
                </div>
                
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <Play className="size-4 text-primary" />
                    Compilacao e Testes
                  </h4>
                  <p className="text-sm">
                    Compila seu codigo com as flags obrigatorias (-Wall -Wextra -Werror) e 
                    executa testes automatizados para cada exercicio.
                  </p>
                </div>
                
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <BookOpen className="size-4 text-primary" />
                    Navegador de Exercicios
                  </h4>
                  <p className="text-sm">
                    Acesse todos os exercicios da Piscine (C00 a C07, Shell00 e Shell01) 
                    organizados na barra lateral do VSCode.
                  </p>
                </div>
                
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                    <RefreshCw className="size-4 text-primary" />
                    Sincronizacao
                  </h4>
                  <p className="text-sm">
                    Seu progresso e sincronizado com a plataforma web, permitindo 
                    continuar de onde parou em qualquer dispositivo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Todos os Comandos */}
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Keyboard className="size-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Todos os Comandos</h3>
            </div>
            
            <div className="space-y-3">
              {COMMANDS.map((cmd, index) => (
                <div 
                  key={index}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-primary">
                          {cmd.command}
                        </code>
                        {cmd.shortcut && (
                          <kbd className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </div>
                      <h4 className="font-semibold text-foreground">{cmd.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{cmd.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regras da Norminette */}
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <AlertTriangle className="size-5 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Regras da Norminette</h3>
            </div>
            
            <p className="mb-4 text-muted-foreground">
              A Norminette e o verificador de estilo oficial da 42. Seu codigo deve seguir todas estas regras:
            </p>
            
            <div className="grid gap-3 md:grid-cols-2">
              {NORMINETTE_RULES.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-500" />
                  <div>
                    <h4 className="font-medium text-foreground">{item.rule}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Como usar no terminal */}
          <div className="mb-12 rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Terminal className="size-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Usando no Terminal do VSCode</h3>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                A extensao utiliza o terminal integrado do VSCode para compilar e testar seu codigo. 
                Veja como funciona:
              </p>
              
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="mb-3 font-semibold text-foreground">1. Compilacao</h4>
                <div className="rounded bg-background p-3 font-mono text-sm">
                  <span className="text-green-500">$</span> gcc -Wall -Wextra -Werror ft_putchar.c -o test
                </div>
                <p className="mt-2 text-sm">
                  A extensao compila automaticamente com todas as flags obrigatorias da 42.
                </p>
              </div>
              
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="mb-3 font-semibold text-foreground">2. Execucao de Testes</h4>
                <div className="rounded bg-background p-3 font-mono text-sm">
                  <span className="text-green-500">$</span> ./test
                  <br />
                  <span className="text-muted-foreground"># Saida dos testes automatizados</span>
                </div>
                <p className="mt-2 text-sm">
                  Os testes verificam casos de borda, valores limites e comportamentos esperados.
                </p>
              </div>
              
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="mb-3 font-semibold text-foreground">3. Verificacao de Memory Leaks</h4>
                <div className="rounded bg-background p-3 font-mono text-sm">
                  <span className="text-green-500">$</span> valgrind --leak-check=full ./test
                </div>
                <p className="mt-2 text-sm">
                  Em sistemas Linux/Mac, a extensao pode verificar vazamentos de memoria com Valgrind.
                </p>
              </div>
            </div>
          </div>

          {/* Configuracoes */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="size-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Configuracoes Disponiveis</h3>
            </div>
            
            <p className="mb-4 text-muted-foreground">
              Acesse <code className="rounded bg-secondary px-1.5 py-0.5 text-sm">Preferences &gt; Settings</code> e 
              procure por &quot;Treino Pro&quot; para personalizar:
            </p>
            
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Configuracao</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Padrao</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Descricao</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-primary">showNorminetteOnSave</td>
                      <td className="px-4 py-3 text-foreground">true</td>
                      <td className="px-4 py-3 text-muted-foreground">Verificar Norminette ao salvar</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-primary">realTimeValidation</td>
                      <td className="px-4 py-3 text-foreground">true</td>
                      <td className="px-4 py-3 text-muted-foreground">Validacao em tempo real enquanto digita</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-primary">checkMemoryLeaks</td>
                      <td className="px-4 py-3 text-foreground">true</td>
                      <td className="px-4 py-3 text-muted-foreground">Verificar memory leaks com Valgrind</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-primary">maxLineLength</td>
                      <td className="px-4 py-3 text-foreground">80</td>
                      <td className="px-4 py-3 text-muted-foreground">Comprimento maximo de linha</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-primary">autoSave</td>
                      <td className="px-4 py-3 text-foreground">true</td>
                      <td className="px-4 py-3 text-muted-foreground">Salvar progresso automaticamente</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-primary">enableCopilotIntegration</td>
                      <td className="px-4 py-3 text-foreground">true</td>
                      <td className="px-4 py-3 text-muted-foreground">Ativar integracao com GitHub Copilot</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-8 md:p-12">
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
              Pronto para Comecar?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Baixe a extensao agora e comece a treinar no seu ambiente de desenvolvimento favorito.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="size-5" />
                Download Agora
              </Button>
              <Link href="/treinar">
                <Button variant="outline" size="lg" className="gap-2">
                  Treinar na Web
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <Image 
                src="/images/treino-pro-logo.png" 
                alt="Treino Pro" 
                width={32} 
                height={32}
                className="rounded-md"
              />
              <span className="font-semibold">Treino Pro VSCode Extension</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Treino Pro - Plataforma de Estudos
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
