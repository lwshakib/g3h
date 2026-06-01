import { Background } from "@/components/background"
import { Navbar } from "@/components/landing-page/navbar"
import { Hero } from "@/components/landing-page/hero"
import { Logos } from "@/components/landing-page/logos"
import { Features } from "@/components/landing-page/features"
import { ResourceAllocation } from "@/components/landing-page/resource-allocation"
import { Testimonials } from "@/components/landing-page/testimonials"
import { Pricing } from "@/components/landing-page/pricing"
import { FAQ } from "@/components/landing-page/faq"
import { Footer } from "@/components/landing-page/footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <Background className="via-muted to-muted/80">
        <Hero />
        <Logos />
        <Features />
        <ResourceAllocation />
      </Background>
      <Testimonials />
      <Background variant="bottom">
        <Pricing />
        <FAQ />
      </Background>
      <Footer />
    </>
  )
}
