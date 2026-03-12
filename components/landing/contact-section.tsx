import { Github, Phone, Mail, ExternalLink, MapPin, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "./animated-section"

const CONTACT_LINKS = [
  {
    icon: Github,
    label: "@juniorwebyte",
    href: "https://github.com/juniorwebyte",
    description: "GitHub",
  },
  {
    icon: Phone,
    label: "(11) 98480-1839",
    href: "tel:+5511984801839",
    description: "Telefone",
  },
  {
    icon: Mail,
    label: "contato@webytehub.com",
    href: "mailto:contato@webytehub.com",
    description: "Email",
  },
  {
    icon: MapPin,
    label: "Sao Paulo, SP - Brasil",
    href: "#",
    description: "Localizacao",
  },
]

export function ContactSection() {
  return (
    <section id="contato" className="relative overflow-hidden border-t border-border bg-card/50 px-4 py-20 md:py-28">
      {/* Floating decorative */}
      <div className="pointer-events-none absolute top-12 right-8 animate-float text-primary/5">
        <MessageSquare className="size-14 md:size-20" />
      </div>

      <div className="mx-auto max-w-4xl">
        <AnimatedSection>
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-semibold tracking-wider text-primary uppercase">
              Contato
            </span>
            <h2 className="text-balance text-2xl font-bold text-foreground md:text-4xl">
              Entre em contato conosco
            </h2>
            <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Tem duvidas, sugestoes ou quer contribuir com o projeto? Entre em
              contato ou nos acompanhe nas redes.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACT_LINKS.map((link, i) => (
            <AnimatedSection key={link.label} className={`animation-delay-${(i + 1) * 200}`}>
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <link.icon className="size-5 text-primary" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    {link.description}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {link.label}
                  </span>
                </div>
              </a>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
            <h3 className="mb-3 text-lg font-bold text-foreground">
              Desenvolvido por WebyteHub
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Somos apaixonados por tecnologia e educacao. O Treino PRO e um
              projeto open source mantido com dedicacao para ajudar a comunidade
              42.
            </p>
            <a
              href="https://www.webytehub.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                Visitar WebyteHub
                <ExternalLink className="size-3.5" />
              </Button>
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
