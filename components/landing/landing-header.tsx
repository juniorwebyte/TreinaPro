"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Menu, Heart, GraduationCap, Brain, ChevronDown, Dumbbell, BookOpen, Target, BarChart3, Wallet, Users, Settings, Code2 } from "lucide-react"
import Link from "next/link"
import { NotificationSettings } from "@/components/pwa/notification-settings"

const NAV_ITEMS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Quem Somos", href: "#quem-somos" },
  { label: "Linguagens", href: "#linguagens" },
  { label: "Hub 42", href: "#hub-42" },
  { label: "API", href: "#api" },
  { label: "Contato", href: "#contato" },
  { label: "Apoie", href: "#apoie", highlight: true },
]

const STUDY_MENU_ITEMS = [
  { label: "Mapa Mental", href: "/mapa-mental", icon: Brain, description: "Conceitos visuais" },
  { label: "Guia Exam02", href: "/exam02", icon: GraduationCap, description: "Preparacao para prova" },
  { label: "Treinar Agora", href: "/treinar", icon: Dumbbell, description: "Exercicios praticos" },
  { label: "Simular Exame", href: "/exam-simulator", icon: Target, description: "Modo prova real" },
  { label: "Dashboard", href: "/dashboard", icon: BarChart3, description: "Seu progresso" },
  { label: "Flashcards", href: "/flashcards", icon: Wallet, description: "Memorize conceitos" },
  { label: "Colaborativo", href: "/collaborative", icon: Users, description: "Estude em grupo" },
  { label: "Extensao VSCode", href: "/vscode-extension", icon: Code2, description: "Treine no editor" },
  { label: "Configuracoes", href: "/settings", icon: Settings, description: "GitHub e mais" },
]

export function LandingHeader() {
  const [activeSection, setActiveSection] = useState("inicio")
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)

      const sections = NAV_ITEMS.map((item) => item.href.replace("#", ""))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  function scrollToSection(href: string) {
    const id = href.replace("#", "")
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    setMobileOpen(false)
  }

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/95 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <button
          onClick={() => scrollToSection("#inicio")}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <img
            src="/images/logo.png"
            alt="Treino PRO Logo"
            className="h-20 w-20 rounded-xl object-contain md:h-24 md:w-24"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground md:text-xl">
              Treino PRO
            </span>
            <span className="hidden text-xs text-muted-foreground md:inline">
              Plataforma de Estudos - 42 SP
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegacao principal">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "highlight" in item && item.highlight
                  ? "flex items-center gap-1.5 text-primary hover:bg-primary/10"
                  : activeSection === item.href.replace("#", "")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {"highlight" in item && item.highlight && <Heart className="size-3.5" />}
              {item.label}
            </button>
          ))}
          
          {/* Dropdown de Estudos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-3 gap-2">
                <BookOpen className="size-4" />
                Estudos
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {STUDY_MENU_ITEMS.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center gap-3 cursor-pointer">
                    <item.icon className="size-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/treinar" className="flex items-center gap-3 cursor-pointer">
                  <Dumbbell className="size-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-medium text-primary">Comecar a Treinar</span>
                    <span className="text-xs text-muted-foreground">Iniciar exercicios agora</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Settings */}
          <NotificationSettings />
        </nav>

        {/* Mobile nav */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9">
                <Menu className="size-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[280px] flex-col border-border bg-card p-0">
              <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
              
              {/* Header fixo do menu */}
              <div className="flex shrink-0 items-center gap-3 border-b border-border p-4">
                <img
                  src="/images/logo.png"
                  alt="Treino PRO Logo"
                  className="h-10 w-10 rounded-md object-contain"
                />
                <span className="font-bold text-foreground">Treino PRO</span>
              </div>
              
              {/* Area com scroll */}
              <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col gap-1 p-4">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => scrollToSection(item.href)}
                      className={cn(
                        "rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        "highlight" in item && item.highlight
                          ? "flex items-center gap-2 text-primary hover:bg-primary/10"
                          : activeSection === item.href.replace("#", "")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      {"highlight" in item && item.highlight && <Heart className="size-3.5" />}
                      {item.label}
                    </button>
                  ))}
                </nav>
                
                {/* Secao de Estudos no Mobile */}
                <div className="border-t border-border px-4 pb-4 pt-4">
                  <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <BookOpen className="size-3" />
                    Estudos
                  </p>
                  <div className="flex flex-col gap-1">
                    {STUDY_MENU_ITEMS.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                          <item.icon className="size-4 text-primary" />
                          <div className="flex flex-col">
                            <span>{item.label}</span>
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          </div>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Footer fixo do menu */}
              <div className="shrink-0 border-t border-border p-4">
                <Link href="/treinar" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full gap-2">
                    <Dumbbell className="size-4" />
                    Comecar a Treinar
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
