import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PricingPreview } from "@/components/sections/pricing-preview";
import { SectionHeading } from "@/components/shared/section-heading";
import { SERVICES } from "@/constants/services";
import { FadeIn } from "@/components/shared/fade-in";
import { CtaSection } from "@/components/sections/cta";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Flat-rate visits, recurring care or fully managed contracts. Transparent pricing with no hidden fees.",
};

const FAQ = [
  {
    q: "Do I have to sign a contract?",
    a: "No. One-off and on-demand services are pay-as-you-go. Recurring plans and corporate contracts can be paused or cancelled with 30 days notice.",
  },
  {
    q: "Are your prices fixed or estimates?",
    a: "Most services are flat-rate based on property size and scope. For complex jobs we provide a fixed quote after a quick walkthrough — no surprise invoices, ever.",
  },
  {
    q: "What forms of payment do you accept?",
    a: "Card, ACH and invoice-on-net for corporate accounts. Recurring plans are billed automatically with itemized receipts.",
  },
  {
    q: "Do you bring your own supplies?",
    a: "Yes — premium, eco-friendly products and commercial-grade equipment are included in every visit.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title={<>Transparent pricing for <span className="gradient-text">every property</span>.</>}
        description="Choose a plan, add services, scale at any time. All prices below are starting rates — your dashboard will show exact figures before you book."
      />

      <PricingPreview />

      <section className="section-padding">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Per-service pricing"
            title={<>Starting rates by <span className="gradient-text">service line</span>.</>}
            description="A quick reference for the starting price of each individual service."
            className="mb-12"
          />
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground font-medium px-6 py-4">Service</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted-foreground font-medium px-6 py-4 hidden sm:table-cell">Description</th>
                  <th className="text-right text-xs uppercase tracking-wider text-muted-foreground font-medium px-6 py-4">Starting price</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((s, i) => (
                  <tr
                    key={s.slug}
                    className={`${i !== SERVICES.length - 1 ? "border-b border-border/40" : ""} hover:bg-foreground/[0.02] transition-colors`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="grid place-items-center size-9 rounded-xl bg-accent/10 text-accent">
                          <s.icon className="size-4" />
                        </div>
                        <span className="font-medium text-foreground">{s.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground hidden sm:table-cell max-w-md">
                      {s.description}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-display text-lg font-semibold">${s.startingPrice}</span>
                      <span className="text-xs text-muted-foreground ml-1">{s.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            align="left"
            className="mb-10"
          />
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <FadeIn
                key={item.q}
                delay={i * 0.05}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-subtle"
              >
                <h3 className="font-display text-lg font-semibold">{item.q}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
