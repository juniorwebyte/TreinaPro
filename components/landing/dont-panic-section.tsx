"use client"

import { useEffect, useState, useRef } from "react"
import { Sparkles, Rocket, Star, Zap } from "lucide-react"

function GlowingParticle({ delay, duration, startX, startY }: { delay: number; duration: number; startX: number; startY: number }) {
  return (
    <div
      className="absolute size-1 rounded-full bg-primary opacity-0"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        animation: `particle-float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  )
}

function FloatingStar({ className, delay }: { className: string; delay: number }) {
  return (
    <Star
      className={`absolute size-4 text-primary/20 ${className}`}
      style={{
        animation: `star-twinkle 3s ease-in-out ${delay}s infinite`,
      }}
    />
  )
}

export function DontPanicSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [letterIndex, setLetterIndex] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const phrase = "Don't Panic."

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true)
          setHasAnimated(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  useEffect(() => {
    if (isVisible && letterIndex < phrase.length) {
      const timeout = setTimeout(() => {
        setLetterIndex((prev) => prev + 1)
      }, 120)
      return () => clearTimeout(timeout)
    }
  }, [isVisible, letterIndex, phrase.length])

  // Gerar particulas
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
  }))

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-background via-background to-card py-32"
    >
      {/* Animated background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Glowing orbs */}
        <div 
          className="absolute left-1/4 top-1/4 size-96 rounded-full bg-primary/5 blur-3xl"
          style={{
            animation: "pulse-glow 4s ease-in-out infinite",
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 size-80 rounded-full bg-accent/5 blur-3xl"
          style={{
            animation: "pulse-glow 5s ease-in-out 1s infinite",
          }}
        />
        
        {/* Floating particles */}
        {particles.map((p) => (
          <GlowingParticle key={p.id} {...p} />
        ))}
        
        {/* Floating stars */}
        <FloatingStar className="left-[10%] top-[20%]" delay={0} />
        <FloatingStar className="right-[15%] top-[30%]" delay={0.5} />
        <FloatingStar className="left-[20%] bottom-[25%]" delay={1} />
        <FloatingStar className="right-[25%] bottom-[20%]" delay={1.5} />
        <FloatingStar className="left-[40%] top-[15%]" delay={2} />
        <FloatingStar className="right-[40%] bottom-[30%]" delay={2.5} />
        
        {/* Scanning lines effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent"
          style={{
            animation: "scan-line 8s linear infinite",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        {/* Decorative icons */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <Rocket 
            className={`size-8 text-primary transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"}`}
            style={{ transitionDelay: "0ms" }}
          />
          <Sparkles 
            className={`size-6 text-accent transition-all duration-1000 ${isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
            style={{ transitionDelay: "200ms" }}
          />
          <Zap 
            className={`size-8 text-warning transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            style={{ transitionDelay: "400ms" }}
          />
        </div>

        {/* Main phrase with letter-by-letter animation */}
        <div className="relative mb-8">
          {/* Glowing background for text */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
          >
            <div className="size-64 rounded-full bg-primary/10 blur-3xl" />
          </div>
          
          <h2 className="relative font-mono text-6xl font-black tracking-tight md:text-8xl lg:text-9xl">
            {phrase.split("").map((letter, index) => (
              <span
                key={index}
                className={`inline-block transition-all duration-500 ${
                  index < letterIndex
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-8 scale-75 opacity-0"
                } ${
                  letter === "'" ? "text-accent" : 
                  letter === "." ? "text-warning" : 
                  "text-primary"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  textShadow: index < letterIndex ? "0 0 40px rgba(34, 197, 94, 0.5), 0 0 80px rgba(34, 197, 94, 0.3)" : "none",
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </h2>
        </div>

        {/* Subtitle with typewriter effect */}
        <div 
          className={`mb-12 transition-all duration-1000 delay-[1500ms] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            A Piscine pode parecer desafiadora, mas com{" "}
            <span className="font-semibold text-primary">dedicacao</span> e{" "}
            <span className="font-semibold text-accent">pratica</span>,{" "}
            voce vai conseguir. Estamos aqui para te ajudar nessa jornada.
          </p>
        </div>

        {/* Animated stats/motivation cards */}
        <div 
          className={`grid gap-4 transition-all duration-1000 delay-[2000ms] md:grid-cols-3 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-2 text-4xl font-bold text-primary">42+</div>
              <div className="text-sm text-muted-foreground">Exercicios para praticar</div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl border border-accent/20 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-2 text-4xl font-bold text-accent">7</div>
              <div className="text-sm text-muted-foreground">Linguagens disponiveis</div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl border border-warning/20 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-warning/40 hover:shadow-lg hover:shadow-warning/10">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-2 text-4xl font-bold text-warning">100%</div>
              <div className="text-sm text-muted-foreground">Gratuito e open source</div>
            </div>
          </div>
        </div>

        {/* Animated border decoration */}
        <div 
          className={`mx-auto mt-12 h-px w-32 bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-1000 delay-[2500ms] ${
            isVisible ? "w-64 opacity-100" : "w-0 opacity-0"
          }`}
        />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes particle-float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0.4;
          }
          90% {
            opacity: 0;
          }
        }
        
        @keyframes star-twinkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.6;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
        
        @keyframes scan-line {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
      `}</style>
    </section>
  )
}
