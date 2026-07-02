import { MapPin, Timer } from "lucide-react";
import { SERVICE_AREAS } from "@/constants/service-areas";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

export function ServiceAreasSection() {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <SectionHeading
          eyebrow="Where we serve"
          title={<>Coverage across <span className="gradient-text">26 service zones</span>.</>}
          description="Same-day response in central zones, scheduled programs everywhere else. Expanding monthly."
          className="mb-16"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICE_AREAS.map((area, i) => (
            <FadeIn
              key={area.name}
              delay={(i % 3) * 0.08}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 transition-all duration-500 hover:shadow-lift hover:-translate-y-1"
            >
              <div className="absolute -top-16 -right-16 size-40 rounded-full bg-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid place-items-center size-11 rounded-xl bg-accent/10 text-accent">
                    <MapPin className="size-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/70">
                    <Timer className="size-3" />
                    {area.responseTime}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">
                  {area.name}
                </h3>
                <p className="text-sm text-muted-foreground">{area.region}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {area.postcodes.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center rounded-md bg-foreground/5 px-2 py-0.5 text-[11px] font-mono text-foreground/70"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
