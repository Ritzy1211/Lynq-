import {
  BadgeCheck,
  ShieldCheck,
  Zap,
  TagsIcon,
  CalendarCheck,
  Headphones,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Trained Professionals",
    desc: "Background-checked, on-boarded and continuously trained — every technician.",
  },
  {
    icon: ShieldCheck,
    title: "Fully Insured Services",
    desc: "General liability, workers' comp and bonded staff for every job.",
  },
  {
    icon: Zap,
    title: "Same Day Availability",
    desc: "Real capacity for urgent cleans, repairs and overnight programs.",
  },
  {
    icon: TagsIcon,
    title: "Transparent Pricing",
    desc: "Flat-rate or itemized — never hidden fees, never surprise invoices.",
  },
  {
    icon: CalendarCheck,
    title: "Online Booking",
    desc: "Book, reschedule and manage every visit from a clean modern dashboard.",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    desc: "Real humans on call. SLA-backed response on every contract.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="section-padding">
      <div className="container-wide">
        <SectionHeading
          eyebrow="Why TotalCare"
          title={<>Premium operations, <span className="gradient-text">obsessive standards</span>.</>}
          description="The service experience you’d expect from a modern SaaS — applied to cleaning, laundry and property care."
          className="mb-16"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {FEATURES.map((f, i) => (
            <FadeIn
              key={f.title}
              delay={(i % 3) * 0.08}
              y={24}
              className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-7 lg:p-8 transition-all duration-500 hover:shadow-lift hover:-translate-y-1"
            >
              <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
              <div className="absolute -top-20 -right-20 size-56 rounded-full bg-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative flex items-start gap-5">
                <div className="grid place-items-center size-12 rounded-2xl bg-foreground text-white shadow-soft shrink-0 group-hover:bg-accent transition-colors duration-300">
                  <f.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
