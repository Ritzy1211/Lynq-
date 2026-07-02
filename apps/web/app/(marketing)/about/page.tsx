import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, HeartHandshake, Sparkles, Target } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/sections/cta";

export const metadata: Metadata = {
  title: "About",
  description:
    "We are an integrated cleaning and property care company building modern, accountable service for homes, estates and enterprise teams.",
};

const VALUES = [
  {
    icon: Sparkles,
    title: "Premium by default",
    desc: "Every service line is built to a single standard — visible, measurable, repeatable.",
  },
  {
    icon: HeartHandshake,
    title: "Operate with care",
    desc: "Vetted, trained, well-paid teams who treat your property as if it were their own.",
  },
  {
    icon: Target,
    title: "Transparent always",
    desc: "Itemized scopes, clear KPIs, honest invoices. No surprises, no hidden fees.",
  },
  {
    icon: Compass,
    title: "One trusted partner",
    desc: "From a single visit to a multi-site contract, we’re the single accountable team.",
  },
];

const TIMELINE = [
  { year: "2013", title: "Founded as a local laundry service", desc: "Started with garment care for a single neighborhood." },
  { year: "2016", title: "Expanded into home & office cleaning", desc: "First commercial contracts and dedicated cleaning crews." },
  { year: "2019", title: "Launched fumigation & pressure washing", desc: "Vertical integration around full property care." },
  { year: "2022", title: "Estate & facility management division", desc: "Multi-site SLA-backed contracts for enterprise clients." },
  { year: "2025", title: "Integrated cleaning & property care platform", desc: "Modern booking, dashboards and a single accountable team." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About TotalCare"
        title={<>One team, built around <span className="gradient-text">premium property care</span>.</>}
        description="TotalCare is an integrated cleaning and property care company. We replace fragmented vendors with one accountable, SLA-backed team across every service your property needs."
      >
        <Button asChild variant="accent" size="lg">
          <Link href="/contact">
            Work with us <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </PageHeader>

      <section className="container-wide">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { v: 12, s: "+", l: "Years of experience" },
            { v: 26, s: "", l: "Service zones" },
            { v: 180, s: "+", l: "Team members" },
            { v: 98, s: "%", l: "Client retention" },
          ].map((s) => (
            <FadeIn key={s.l} className="rounded-3xl border border-border/70 bg-card p-7 shadow-subtle">
              <div className="font-display text-3xl font-semibold gradient-text">
                <AnimatedCounter value={s.v} suffix={s.s} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Mission / values */}
      <section className="section-padding">
        <div className="container-wide grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="What we believe"
              title={<>Property care, <span className="gradient-text">modernized</span>.</>}
              description="Cleaning and property care has been stuck in the analog era — opaque pricing, unreliable crews, fragmented vendors. We're building the alternative."
              align="left"
            />
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <FadeIn
                key={v.title}
                delay={(i % 2) * 0.08}
                className="rounded-3xl border border-border/70 bg-card p-7 shadow-subtle transition-all duration-500 hover:shadow-lift hover:-translate-y-1"
              >
                <div className="grid place-items-center size-12 rounded-2xl bg-accent/10 text-accent">
                  <v.icon className="size-5" />
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Journey"
            title={<>From single service to <span className="gradient-text">integrated platform</span>.</>}
            description="A decade-plus of compounding standards, every step deliberate."
            className="mb-16"
          />
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-3 sm:left-1/2 sm:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
            <ol className="space-y-12">
              {TIMELINE.map((item, i) => (
                <FadeIn key={item.year} delay={i * 0.06}>
                  <li className="relative flex items-start gap-6 sm:grid sm:grid-cols-2 sm:gap-12">
                    <div className={`absolute left-3 sm:left-1/2 sm:-translate-x-1/2 size-3 rounded-full bg-accent ring-4 ring-background mt-2`} />
                    <div className={`pl-10 sm:pl-0 ${i % 2 === 0 ? "sm:text-right sm:pr-12" : "sm:col-start-2 sm:pl-12"}`}>
                      <div className="text-sm font-mono text-accent">{item.year}</div>
                      <h3 className="mt-2 font-display text-xl font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                </FadeIn>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Careers */}
      <section id="careers" className="container-wide">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-white p-10 sm:p-14 shadow-soft">
          <div className="absolute -top-32 -right-20 size-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="pill-accent">We're hiring</span>
              <h3 className="mt-5 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Join a team that runs cleaning like a modern operation.
              </h3>
              <p className="mt-4 text-muted-foreground max-w-md">
                Field technicians, account managers, operations leads. Fair pay, clear paths, real career growth.
              </p>
            </div>
            <div className="flex lg:justify-end">
              <Button asChild variant="primary" size="lg">
                <Link href="/contact">
                  See open roles <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
