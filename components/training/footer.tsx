import { ExternalLink, Github, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-3">
      <div className="flex flex-col items-center gap-2 text-center text-[11px] text-muted-foreground md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
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

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/juniorwebyte"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="size-3" />
            @juniorwebyte
          </a>
          <a
            href="tel:+5511984801839"
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Phone className="size-3" />
            (11) 98480-1839
          </a>
        </div>

        <span className="text-muted-foreground/60">
          Treino PRO - Todos os direitos reservados
        </span>
      </div>
    </footer>
  )
}
