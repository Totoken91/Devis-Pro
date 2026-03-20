import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import PricingSection from '@/components/landing/PricingSection'
import CtaSection from '@/components/landing/CtaSection'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
