"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Instagram, Linkedin, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { FOOTER_LINKS } from "@/constants/navigation";
import { SITE } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <footer className="relative mt-32 overflow-hidden">
      {/* Top CTA strip */}
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-3xl bg-foreground text-white p-8 sm:p-12 lg:p-16 shadow-lift">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute -top-32 -left-20 size-96 rounded-full bg-accent/40 blur-3xl" />
            <div className="absolute -bottom-32 -right-10 size-96 rounded-full bg-secondary/30 blur-3xl" />
          </div>
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="pill border-white/20 bg-white/10 text-white/80">
                <span className="size-1.5 rounded-full bg-accent" />
                Subscribe
              </span>
              <h2 className="heading-lg mt-5 text-white">
                Premium service updates,<br /> straight to your inbox.
              </h2>
              <p className="mt-3 text-white/70 max-w-md">
                Seasonal property care guides, member-only offers and operational checklists. No spam — ever.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) {
                  setSubmitted(true);
                  setEmail("");
                }
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-accent"
                aria-label="Email address"
              />
              <Button type="submit" variant="accent" size="lg" className="h-14 shrink-0">
                Subscribe
                <ArrowUpRight className="size-4" />
              </Button>
            </form>
          </div>
          {submitted && (
            <p className="relative mt-4 text-sm text-accent">Thanks — you’re on the list.</p>
          )}
        </div>
      </div>

      {/* Main footer */}
      <div className="container-wide mt-20 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Logo />
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {SITE.tagline}. One trusted team for cleaning, laundry, fumigation, pressure washing and facility management.
          </p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
              <Mail className="size-4" /> {SITE.email}
            </a>
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
              <Phone className="size-4" /> {SITE.phone}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4" /> {SITE.address}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { icon: Instagram, href: SITE.social.instagram, label: "Instagram" },
              { icon: Twitter, href: SITE.social.twitter, label: "Twitter" },
              { icon: Linkedin, href: SITE.social.linkedin, label: "LinkedIn" },
              { icon: Facebook, href: SITE.social.facebook, label: "Facebook" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="grid place-items-center size-10 rounded-full border border-border/70 bg-white text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-10">
          <FooterColumn title="Services" links={FOOTER_LINKS.services} />
          <FooterColumn title="Company" links={FOOTER_LINKS.company} />
          <FooterColumn title="Resources" links={FOOTER_LINKS.resources} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="container-wide mt-16 pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-border/70 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE.legalName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/60">{title}</h4>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
