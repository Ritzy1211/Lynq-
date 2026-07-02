import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PORTFOLIO } from "@/constants/portfolio";
import { FadeIn } from "@/components/shared/fade-in";
import { CtaSection } from "@/components/sections/cta";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected projects across cleaning, estate care, fumigation, pressure washing and facility management.",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title={<>Work we’re <span className="gradient-text">proud of</span>.</>}
        description="A selection of homes, estates and enterprise programs we’ve scoped, delivered and maintained."
      />

      <section className="container-wide">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {PORTFOLIO.map((p, i) => (
            <FadeIn
              key={p.slug}
              delay={(i % 3) * 0.06}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft transition-all duration-500 hover:shadow-lift hover:-translate-y-1"
            >
              <div className={cn("relative aspect-[4/3] overflow-hidden bg-gradient-to-br", p.gradient)}>
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-medium text-foreground shadow-subtle">
                    {p.category}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-foreground/90 text-white backdrop-blur px-3 py-1 text-xs font-semibold">
                    {p.metric}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground font-mono">{p.scope}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 group-hover:text-accent transition-colors">
                  Read case study <ArrowUpRight className="size-3.5" />
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
