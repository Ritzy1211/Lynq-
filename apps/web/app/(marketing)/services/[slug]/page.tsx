import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check, Calculator } from "lucide-react";
import { SERVICES, SERVICE_ACCENT_CLASSES, getServiceBySlug } from "@/constants/services";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/sections/cta";
import { BeforeAfterSlider } from "@/components/shared/before-after-slider";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.title,
    description: service.longDescription,
  };
}

const PROCESS_STEPS = [
  { n: "01", title: "Book or request a quote", desc: "Pick a date, scope and frequency online — or talk to our team for custom programs." },
  { n: "02", title: "Walkthrough & scope", desc: "A service lead confirms the scope, access and any special handling requirements." },
  { n: "03", title: "Trained crew arrives", desc: "Vetted, insured technicians arrive on schedule with all supplies and equipment." },
  { n: "04", title: "Quality check & report", desc: "We document the work, capture before/after media and follow up to confirm satisfaction." },
];

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const accent = SERVICE_ACCENT_CLASSES[service.accent];
  const others = SERVICES.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={service.shortTitle}
        title={<>{service.title}<span className="gradient-text">.</span></>}
        description={service.longDescription}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="accent" size="lg">
            <Link href={`/book?service=${service.slug}`}>
              Book this service <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/book?step=quote&service=${service.slug}`}>
              <Calculator className="size-4" /> Get a quote
            </Link>
          </Button>
        </div>
      </PageHeader>

      <section className="container-wide">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-7">
            <div className={cn(
              "relative aspect-[16/10] overflow-hidden rounded-3xl border border-border/70 shadow-soft bg-gradient-to-br",
              accent.bg.replace("/10", "/30"),
            )}>
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="absolute inset-0 grid place-items-center">
                <service.icon className={cn("size-32", accent.text)} strokeWidth={1.2} />
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className={cn("inline-flex items-center gap-3 rounded-2xl border p-5", accent.border, accent.bg)}>
              <div className={cn("grid place-items-center size-12 rounded-xl", accent.text)}>
                <service.icon className="size-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Starting from</div>
                <div className="font-display text-2xl font-semibold">
                  ${service.startingPrice}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{service.unit}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold">What’s included</h3>
              <ul className="mt-5 space-y-3">
                {service.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className={cn("grid place-items-center size-5 rounded-full mt-0.5 shrink-0", accent.bg, accent.text)}>
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          <SectionHeading
            eyebrow="How it works"
            title={<>A simple, <span className="gradient-text">accountable</span> process.</>}
            description="From the first request to the final quality report — every step documented."
            className="mb-14"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS_STEPS.map((s, i) => (
              <FadeIn
                key={s.n}
                delay={i * 0.06}
                className="relative rounded-3xl border border-border/70 bg-card p-7 shadow-subtle"
              >
                <div className="text-xs font-mono text-muted-foreground">{s.n}</div>
                <h4 className="mt-4 font-display text-lg font-semibold">{s.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Real results"
            title={<>The standard, <span className="gradient-text">visualized</span>.</>}
            description="Every service captured before and after — the standard speaks for itself."
            className="mb-12"
          />
          <div className="max-w-4xl mx-auto">
            <BeforeAfterSlider
              beforeGradient="from-stone-400 via-stone-500 to-stone-600"
              afterGradient="from-emerald-300 via-cyan-300 to-sky-400"
            />
          </div>
        </div>
      </section>

      <section className="container-wide">
        <SectionHeading
          eyebrow="Explore more"
          title={<>Other <span className="gradient-text">services</span> in the program.</>}
          align="left"
          className="mb-10"
        />
        <div className="grid sm:grid-cols-3 gap-5">
          {others.map((s) => {
            const a = SERVICE_ACCENT_CLASSES[s.accent];
            return (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group rounded-3xl border border-border/70 bg-card p-6 shadow-subtle hover:shadow-soft hover:-translate-y-0.5 transition-all"
              >
                <div className={cn("grid place-items-center size-10 rounded-xl ring-1", a.bg, a.ring, a.text)}>
                  <s.icon className="size-5" />
                </div>
                <h4 className="mt-5 font-display text-lg font-semibold">{s.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 group-hover:text-accent transition-colors">
                  Explore <ArrowUpRight className="size-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <CtaSection />
    </>
  );
}
