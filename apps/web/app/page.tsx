import { Background } from "@/components/background"
import { Navbar } from "@/components/blocks/navbar"
import { Hero } from "@/components/blocks/hero"
import { Logos } from "@/components/blocks/logos"
import { Features } from "@/components/blocks/features"
import { ResourceAllocation } from "@/components/blocks/resource-allocation"
import { Testimonials } from "@/components/blocks/testimonials"
import { Pricing } from "@/components/blocks/pricing"
import { FAQ } from "@/components/blocks/faq"
import { Footer } from "@/components/blocks/footer"

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
