import { ExternalLink, Github, Phone, Heart } from "lucide-react"
import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center text-xs text-muted-foreground md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 rounded bg-primary/20 blur-sm" />
            <img
              src="/images/logo.png"
              alt="Treino PRO"
              className="relative h-8 w-8 rounded object-contain"
            />
          </div>
          <span>
            Desenvolvido por{" "}
            <a
              href="https://www.webytehub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              WebyteHub
              <ExternalLink className="size-2.5" />
            </a>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://github.com/juniorwebyte"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Github className="size-3" />
            @juniorwebyte
          </a>
          <a
            href="tel:+5511984801839"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Phone className="size-3" />
            (11) 98480-1839
          </a>
          <a
            href="https://www.42sp.org.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-3" />
            42 SP
          </a>
        </div>

        <span className="text-muted-foreground/60">
          Treino PRO - Todos os direitos reservados
        </span>
      </div>
    </footer>
  )
}
