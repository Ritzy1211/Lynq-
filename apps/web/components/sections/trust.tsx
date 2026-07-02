import { AnimatedCounter } from "@/components/shared/animated-counter";
import { FadeIn } from "@/components/shared/fade-in";

const STATS = [
  { value: 12, suffix: "+", label: "Years of experience" },
  { value: 4800, suffix: "+", label: "Projects completed" },
  { value: 2400, suffix: "+", label: "Happy clients" },
  { value: 26, suffix: "", label: "Service locations" },
];

export function TrustSection() {
  return (
    <section className="relative">
      <div className="container-wide">
        <div className="rounded-3xl border border-border/70 bg-white/60 backdrop-blur p-8 sm:p-12 lg:p-16 shadow-soft">
          <FadeIn className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Trusted by homes, estates & enterprise teams
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {STATS.map((s, i) => (
              <FadeIn
                key={s.label}
                delay={i * 0.08}
                className="text-center"
              >
                <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight gradient-text">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
