import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SERVICES, SERVICE_ACCENT_CLASSES, EXTENDED_SERVICES } from "@/constants/services";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { CtaSection } from "@/components/sections/cta";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Cleaning, laundry, fumigation, pressure washing, estate maintenance and facility management — all under one accountable team.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={<>Every service your property needs. <span className="gradient-text">Under one program.</span></>}
        description="Choose a single service or build a tailored multi-service program. SLA-backed, fully insured, dedicated account team."
      />

      <section className="container-wide">
        <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
          {SERVICES.map((service, i) => {
            const accent = SERVICE_ACCENT_CLASSES[service.accent];
            return (
              <FadeIn key={service.slug} delay={(i % 2) * 0.06}>
                <Link
                  href={`/services/${service.slug}`}
                  className={cn(
                    "group relative h-full overflow-hidden rounded-3xl border border-border/70 bg-card p-8 lg:p-10",
                    "shadow-soft transition-all duration-500 hover:shadow-lift hover:-translate-y-1 block",
                  )}
                >
                  <div className={cn("absolute -top-24 -right-24 size-72 rounded-full blur-3xl opacity-60", accent.bg)} />
                  <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className={cn(
                      "grid place-items-center size-14 rounded-2xl ring-1 transition-transform duration-500 group-hover:scale-110",
                      accent.bg, accent.ring, accent.text,
                    )}>
                      <service.icon className="size-6" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      ${service.startingPrice} {service.unit}
                    </span>
                  </div>

                  <div className="relative mt-10">
                    <h2 className="font-display text-2xl lg:text-3xl font-semibold">
                      {service.title}
                    </h2>
                    <p className="mt-3 text-muted-foreground">{service.description}</p>

                    <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
                      <span className="text-sm font-medium text-foreground">Explore service</span>
                      <span className="grid place-items-center size-9 rounded-full bg-foreground/5 text-foreground/70 group-hover:bg-foreground group-hover:text-white transition-all">
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Also offered"
            title={<>Extended services & <span className="gradient-text">contract programs</span>.</>}
            description="On-demand specialist services and bundled corporate programs."
            className="mb-12"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {EXTENDED_SERVICES.map((s, i) => (
              <FadeIn
                key={s.title}
                delay={i * 0.05}
                className="rounded-2xl border border-border/70 bg-white p-6 text-center shadow-subtle hover:shadow-soft transition-shadow"
              >
                <div className="grid place-items-center size-12 mx-auto rounded-xl bg-accent/10 text-accent">
                  <s.icon className="size-5" />
                </div>
                <p className="mt-4 text-sm font-medium">{s.title}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
