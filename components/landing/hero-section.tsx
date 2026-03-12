"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code2, Terminal, Braces, Hash, FileCode, GitBranch, Bug, Cpu, Binary, Database, Globe, Palette, FileJson, Server, GraduationCap } from "lucide-react"

function FloatingCodeElement({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div className={`pointer-events-none absolute select-none font-mono text-xs text-primary/15 md:text-sm ${className}`}>
      {children}
    </div>
  )
}

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-16"
    >
      {/* Animated background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-glow absolute top-1/4 left-1/6 h-72 w-72 rounded-full bg-primary/10" />
        <div className="animate-pulse-glow absolute right-1/6 bottom-1/4 h-56 w-56 rounded-full bg-accent/8 animation-delay-1000" />
        <div className="animate-pulse-glow absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 animation-delay-600" />
      </div>

      {/* Floating code snippets scattered around */}
      <FloatingCodeElement className="animate-float top-[15%] left-[5%] md:left-[10%]">
        {'int main() {'}
      </FloatingCodeElement>
      <FloatingCodeElement className="animate-float-reverse top-[25%] right-[5%] md:right-[12%]">
        {'return (0);'}
      </FloatingCodeElement>
      <FloatingCodeElement className="animate-float-slow top-[60%] left-[3%] md:left-[8%]">
        {'while (*str)'}
      </FloatingCodeElement>
      <FloatingCodeElement className="animate-float bottom-[20%] right-[8%] md:right-[15%] animation-delay-400">
        {'#!/bin/bash'}
      </FloatingCodeElement>
      <FloatingCodeElement className="animate-float-reverse top-[40%] left-[2%] md:left-[5%] animation-delay-800">
        {'def solve():'}
      </FloatingCodeElement>
      <FloatingCodeElement className="animate-float-slow top-[18%] right-[20%] animation-delay-200">
        {'#include <unistd.h>'}
      </FloatingCodeElement>
      <FloatingCodeElement className="animate-float bottom-[30%] left-[15%] animation-delay-600">
        {'malloc(sizeof(int))'}
      </FloatingCodeElement>
      <FloatingCodeElement className="animate-float-reverse bottom-[15%] left-[40%] animation-delay-1000">
        {'git push origin main'}
      </FloatingCodeElement>

      {/* Floating icons */}
      <div className="pointer-events-none absolute top-[30%] right-[3%] animate-float text-primary/10 md:right-[8%]">
        <GitBranch className="size-8 md:size-12" />
      </div>
      <div className="pointer-events-none absolute bottom-[25%] left-[5%] animate-float-reverse text-accent/10 animation-delay-400 md:left-[12%]">
        <Bug className="size-6 md:size-10" />
      </div>
      <div className="pointer-events-none absolute top-[50%] right-[5%] animate-float-slow text-warning/10 animation-delay-800">
        <Cpu className="size-7 md:size-9" />
      </div>
      <div className="pointer-events-none absolute top-[70%] right-[25%] animate-float text-primary/8 animation-delay-200">
        <Binary className="size-6 md:size-8" />
      </div>
      <div className="pointer-events-none absolute top-[12%] left-[25%] animate-float-slow text-accent/8 animation-delay-600">
        <Database className="size-5 md:size-7" />
      </div>

      <div className="animate-slide-up relative z-10 flex max-w-4xl flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="relative">
          <img
            src="/images/logo.png"
            alt="Treino PRO Logo"
            className="relative h-[320px] w-[320px] rounded-2xl object-contain md:h-[440px] md:w-[440px]"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="animate-slide-up text-balance text-3xl font-bold tracking-tight text-foreground animation-delay-200 md:text-5xl lg:text-6xl">
            Prepare-se para a{" "}
            <span className="text-primary">Piscine 42</span>
          </h1>
          <p className="animate-slide-up mx-auto max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground animation-delay-400 md:text-lg">
            Plataforma de estudos interativa com exercicios praticos em C, Shell,
            Python, HTML, CSS, JavaScript e PHP. Treine, aprenda e conquiste sua vaga na 42 Sao Paulo.
          </p>
        </div>

        {/* Language badges with icons */}
        <div className="animate-slide-up flex flex-wrap items-center justify-center gap-3 animation-delay-600">
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-card px-3 py-2 transition-colors hover:border-primary/40 hover:bg-primary/5">
            <Braces className="size-4 text-primary" />
            <span className="text-sm font-medium text-foreground">C</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-card px-3 py-2 transition-colors hover:border-accent/40 hover:bg-accent/5">
            <Terminal className="size-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Shell</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-warning/20 bg-card px-3 py-2 transition-colors hover:border-warning/40 hover:bg-warning/5">
            <Code2 className="size-4 text-warning" />
            <span className="text-sm font-medium text-foreground">Python</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-orange-500/20 bg-card px-3 py-2 transition-colors hover:border-orange-500/40 hover:bg-orange-500/5">
            <Globe className="size-4 text-orange-500" />
            <span className="text-sm font-medium text-foreground">HTML</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-card px-3 py-2 transition-colors hover:border-blue-500/40 hover:bg-blue-500/5">
            <Palette className="size-4 text-blue-500" />
            <span className="text-sm font-medium text-foreground">CSS</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-card px-3 py-2 transition-colors hover:border-yellow-500/40 hover:bg-yellow-500/5">
            <FileJson className="size-4 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">JavaScript</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-indigo-400/20 bg-card px-3 py-2 transition-colors hover:border-indigo-400/40 hover:bg-indigo-400/5">
            <Server className="size-4 text-indigo-400" />
            <span className="text-sm font-medium text-foreground">PHP</span>
          </div>
        </div>

        <div className="animate-slide-up flex flex-col items-center gap-3 animation-delay-800 sm:flex-row">
          <Link href="/treinar">
            <Button size="lg" className="gap-2 text-base">
              Comecar a Treinar
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/exam02">
            <Button variant="outline" size="lg" className="gap-2 text-base">
              <GraduationCap className="size-4" />
              Guia Exam02
            </Button>
          </Link>
        </div>

        {/* Mini terminal preview */}
        <div className="animate-fade-in mt-4 w-full max-w-lg animation-delay-1000">
          <div className="rounded-xl border border-border bg-terminal p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="size-3 rounded-full bg-destructive/60" />
              <div className="size-3 rounded-full bg-warning/60" />
              <div className="size-3 rounded-full bg-primary/60" />
              <span className="ml-2 font-mono text-[10px] text-muted-foreground">terminal</span>
            </div>
            <div className="space-y-1 font-mono text-xs text-terminal-foreground">
              <p><span className="text-primary">$</span> gcc -Wall -Wextra -Werror ft_strlen.c</p>
              <p><span className="text-primary">$</span> ./a.out</p>
              <p className="text-accent">{'>'} Todos os testes passaram!</p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <span className="text-primary">$</span>
                <span className="inline-block w-2 animate-pulse border-r-2 border-primary">{'  '}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
