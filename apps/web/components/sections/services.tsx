"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { SERVICES, SERVICE_ACCENT_CLASSES } from "@/constants/services";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

export function ServicesSection() {
  // Asymmetric grid spans
  const spans = [
    "lg:col-span-7", // 1 wide
    "lg:col-span-5", // 2
    "lg:col-span-4", // 3
    "lg:col-span-4", // 4
    "lg:col-span-4", // 5
    "lg:col-span-6", // 6
    "lg:col-span-6", // 7
  ];

  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
          <SectionHeading
            eyebrow="What we do"
            title={<>One trusted team. <span className="gradient-text">Every service</span> your property needs.</>}
            description="From everyday laundry to multi-site facility contracts — we deliver a single accountable program built on premium operations."
            align="left"
          />
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-accent transition-colors group"
          >
            See all services
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 auto-rows-[minmax(260px,auto)]">
          {SERVICES.map((service, idx) => {
            const accent = SERVICE_ACCENT_CLASSES[service.accent];
            const isWide = spans[idx]?.includes("col-span-7") || spans[idx]?.includes("col-span-6");

            return (
              <FadeIn
                key={service.slug}
                delay={idx * 0.05}
                className={cn("group", spans[idx])}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className={cn(
                    "relative h-full overflow-hidden rounded-3xl border border-border/70 bg-card p-7 lg:p-9",
                    "shadow-soft transition-all duration-500 hover:shadow-lift hover:-translate-y-1",
                    "flex flex-col justify-between",
                  )}
                >
                  {/* Layered background */}
                  <div className={cn("pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-3xl opacity-50 transition-opacity duration-500 group-hover:opacity-80", accent.bg)} />
                  <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div
                      className={cn(
                        "grid place-items-center size-14 rounded-2xl ring-1",
                        accent.bg,
                        accent.ring,
                        accent.text,
                        "transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                      )}
                    >
                      <service.icon className="size-6" strokeWidth={2.2} />
                    </div>
                    <motion.span
                      className="grid place-items-center size-10 rounded-full border border-border/70 bg-white/70 backdrop-blur text-foreground/70 group-hover:bg-foreground group-hover:text-white group-hover:border-foreground transition-all duration-300"
                    >
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </motion.span>
                  </div>

                  <div className="relative mt-8 lg:mt-12">
                    <h3 className="font-display text-2xl lg:text-3xl font-semibold leading-tight">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm lg:text-base text-muted-foreground max-w-md">
                      {service.description}
                    </p>

                    {isWide && (
                      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 max-w-md">
                        {service.features.slice(0, 4).map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-xs text-foreground/70"
                          >
                            <Check className={cn("size-3.5 shrink-0 mt-0.5", accent.text)} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-6 flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">From</span>
                      <span className="font-semibold text-foreground">
                        ${service.startingPrice}
                      </span>
                      <span className="text-muted-foreground">{service.unit}</span>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
