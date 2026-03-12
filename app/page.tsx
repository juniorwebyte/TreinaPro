import { LandingHeader } from "@/components/landing/landing-header"
import { HeroSection } from "@/components/landing/hero-section"
import { DontPanicSection } from "@/components/landing/dont-panic-section"
import { AboutSection } from "@/components/landing/about-section"
import { LanguagesSection } from "@/components/landing/languages-section"
import { Hub42Section } from "@/components/landing/hub42-section"
import { ApiSection } from "@/components/landing/api-section"
import { ContactSection } from "@/components/landing/contact-section"
import { SupportSection } from "@/components/landing/support-section"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function Page() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <DontPanicSection />
        <AboutSection />
        <LanguagesSection />
        <Hub42Section />
        <ApiSection />
        <ContactSection />
        <SupportSection />
      </main>
      <LandingFooter />
    </div>
  )
}
