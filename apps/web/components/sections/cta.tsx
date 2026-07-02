import Link from "next/link";
import { ArrowUpRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground text-white p-10 sm:p-16 lg:p-24 shadow-lift">
          {/* Background art */}
          <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />
          <div className="absolute -top-40 -right-20 size-[28rem] rounded-full bg-accent/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-20 size-[28rem] rounded-full bg-secondary/30 blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center space-y-8">
            <span className="pill border-white/15 bg-white/10 text-white/80 mx-auto">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              Ready when you are
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
              Ready to experience{" "}
              <span className="bg-gradient-to-r from-accent via-emerald-300 to-secondary bg-clip-text text-transparent">
                premium cleaning services?
              </span>
            </h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
              Book a service in under two minutes, or scope a tailored contract with our team. We handle the rest.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild variant="accent" size="xl">
                <Link href="/book">
                  Book Service
                  <ArrowUpRight className="size-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link href="/book?step=quote">
                  <Calculator className="size-4" /> Get Free Quote
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
