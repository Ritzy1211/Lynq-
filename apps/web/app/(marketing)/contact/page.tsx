import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ContactForm } from "@/features/contact/contact-form";
import { SITE } from "@/constants/site";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to our team — service inquiries, custom contracts, partnerships.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={<>Let’s build your <span className="gradient-text">service program</span>.</>}
        description="Service inquiries, custom contracts and partnerships. We reply within one business hour."
      />

      <section className="container-wide">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <div className="lg:col-span-5 space-y-4">
            {[
              { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
              { icon: Phone, label: "Phone (24/7)", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}` },
              { icon: MessageCircle, label: "Live chat", value: "Mon–Sun, 7am–11pm", href: "#" },
              { icon: MapPin, label: "HQ", value: SITE.address, href: "#" },
            ].map((c, i) => (
              <FadeIn
                key={c.label}
                delay={i * 0.05}
                className="rounded-3xl border border-border/70 bg-card p-6 shadow-subtle hover:shadow-soft transition-shadow"
              >
                <a href={c.href} className="flex items-start gap-4 group">
                  <div className="grid place-items-center size-12 rounded-2xl bg-accent/10 text-accent shrink-0">
                    <c.icon className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                    <div className="mt-1 text-base font-medium text-foreground group-hover:text-accent transition-colors">
                      {c.value}
                    </div>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wide pt-24">
        <div className="relative aspect-[21/9] rounded-3xl overflow-hidden border border-border/70 shadow-soft">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-cyan-100 to-sky-100" />
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute inset-0 grid place-items-center text-center px-6">
            <div>
              <span className="pill-accent">Service coverage</span>
              <h2 className="mt-6 font-display text-3xl sm:text-4xl font-semibold">
                Serving 26 zones · expanding monthly
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Not in our current map? Send us your postcode — we onboard new neighborhoods every month.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
