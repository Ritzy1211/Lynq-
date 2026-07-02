import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/constants/pricing";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

export function PricingPreview() {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <SectionHeading
          eyebrow="Pricing"
          title={<>Transparent plans for <span className="gradient-text">every space</span>.</>}
          description="Flat-rate visits, recurring care or fully managed contracts. Cancel or change anytime."
          className="mb-16"
        />

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7 items-stretch">
          {PRICING_PLANS.map((plan, i) => {
            const isHighlight = plan.highlight;
            return (
              <FadeIn key={plan.name} delay={i * 0.1} className="flex">
                <div
                  className={cn(
                    "relative w-full rounded-3xl p-8 lg:p-10 transition-all duration-500",
                    "flex flex-col",
                    isHighlight
                      ? "bg-foreground text-white shadow-lift lg:scale-[1.02] lg:-translate-y-1"
                      : "bg-card border border-border/70 shadow-soft hover:shadow-lift",
                  )}
                >
                  {isHighlight && (
                    <>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white shadow-glow">
                          <Sparkles className="size-3.5" /> Most popular
                        </span>
                      </div>
                      <div className="absolute -top-32 -right-32 size-72 rounded-full bg-accent/40 blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-32 -left-20 size-64 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
                    </>
                  )}

                  <div className="relative">
                    <h3 className={cn("font-display text-2xl font-semibold", isHighlight && "text-white")}>
                      {plan.name}
                    </h3>
                    <p className={cn("mt-2 text-sm", isHighlight ? "text-white/70" : "text-muted-foreground")}>
                      {plan.tagline}
                    </p>

                    <div className="mt-8 flex items-baseline gap-1.5">
                      <span className="font-display text-5xl font-semibold">
                        ${plan.price}
                      </span>
                      <span className={cn("text-sm", isHighlight ? "text-white/60" : "text-muted-foreground")}>
                        {plan.unit}
                      </span>
                    </div>

                    <ul className="mt-8 space-y-3.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm">
                          <span
                            className={cn(
                              "grid place-items-center size-5 rounded-full mt-0.5 shrink-0",
                              isHighlight ? "bg-accent text-white" : "bg-accent/10 text-accent",
                            )}
                          >
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                          <span className={cn(isHighlight ? "text-white/90" : "text-foreground/80")}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative mt-10 pt-2">
                    <Button
                      asChild
                      variant={isHighlight ? "accent" : "outline"}
                      size="lg"
                      className="w-full"
                    >
                      <Link href="/book">{plan.cta}</Link>
                    </Button>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Need something custom?{" "}
          <Link href="/contact" className="text-accent hover:underline underline-offset-4">
            Talk to our team
          </Link>
          {" "}— we’ll scope a tailored program.
        </p>
      </div>
    </section>
  );
}
