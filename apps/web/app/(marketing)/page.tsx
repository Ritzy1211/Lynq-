import { Hero } from "@/components/sections/hero";
import { TrustSection } from "@/components/sections/trust";
import { ServicesSection } from "@/components/sections/services";
import { BeforeAfterSection } from "@/components/sections/before-after";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { PricingPreview } from "@/components/sections/pricing-preview";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { ServiceAreasSection } from "@/components/sections/service-areas";
import { BlogPreviewSection } from "@/components/sections/blog-preview";
import { CtaSection } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustSection />
      <ServicesSection />
      <BeforeAfterSection />
      <WhyChooseUs />
      <PricingPreview />
      <TestimonialsSection />
      <ServiceAreasSection />
      <BlogPreviewSection />
      <CtaSection />
    </>
  );
}
