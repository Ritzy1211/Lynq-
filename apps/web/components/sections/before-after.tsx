import { BeforeAfterSlider } from "@/components/shared/before-after-slider";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

export function BeforeAfterSection() {
  return (
    <section className="section-padding bg-gradient-to-b from-transparent via-white to-transparent">
      <div className="container-wide">
        <SectionHeading
          eyebrow="Real results"
          title={<>The difference is <span className="gradient-text">measurable</span>.</>}
          description="Drag to compare. Every project documented with before & after captures — your scope, our standard."
          align="center"
          className="mb-14"
        />

        <FadeIn className="max-w-5xl mx-auto">
          <BeforeAfterSlider
            beforeGradient="from-stone-400 via-stone-500 to-stone-600"
            afterGradient="from-emerald-300 via-cyan-300 to-sky-400"
            beforeLabel="Before · 12 yrs of buildup"
            afterLabel="After · Soft-wash restore"
          />
        </FadeIn>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            { v: "98%", l: "Stain removal rate" },
            { v: "<24h", l: "Average turnaround" },
            { v: "100%", l: "Satisfaction guarantee" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-border/70 bg-white p-5 text-center shadow-subtle"
            >
              <div className="font-display text-2xl font-semibold">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
