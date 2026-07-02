"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calculator,
  Shirt,
  Bug,
  Sparkles,
  Trees,
  Droplets,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FLOATING_BADGES = [
  { label: "Laundry", icon: Shirt, className: "top-6 left-4 sm:left-10 rotate-[-6deg]", delay: 0 },
  { label: "Fumigation", icon: Bug, className: "top-16 right-4 sm:right-12 rotate-[5deg]", delay: 0.5 },
  { label: "Deep Cleaning", icon: Sparkles, className: "bottom-28 left-6 sm:left-2 rotate-[-3deg]", delay: 1 },
  { label: "Estate Care", icon: Trees, className: "bottom-10 right-8 sm:right-2 rotate-[6deg]", delay: 1.5 },
  { label: "Pressure Wash", icon: Droplets, className: "top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 rotate-[-2deg]", delay: 0.8 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background ornaments */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80rem] h-[80rem] rounded-full bg-radial-fade opacity-70" />
        <div className="absolute inset-0 grid-bg mask-fade-b opacity-60" />
      </div>

      <div className="container-wide pt-10 pb-24 lg:pt-20 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="pill-accent w-fit"
            >
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              Integrated Cleaning & Property Care
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="heading-hero"
            >
              Your complete{" "}
              <span className="relative inline-block">
                <span className="gradient-text">cleaning & property care</span>
                <svg
                  aria-hidden
                  viewBox="0 0 300 12"
                  className="absolute -bottom-2 left-0 w-full h-3 text-accent/40"
                  fill="none"
                >
                  <path
                    d="M2 8 Q 75 2, 150 6 T 298 4"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              partner.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="body-lg max-w-xl"
            >
              Professional cleaning, laundry, fumigation and facility management - delivered under one trusted, SLA-backed team. Premium service, modern operations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button asChild variant="accent" size="lg">
                <Link href="/book">
                  Book a Service
                  <ArrowUpRight className="size-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/book?step=quote">
                  <Calculator className="size-4" /> Get Instant Quote
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.45 }}
              className="flex items-center gap-6 pt-4"
            >
              <div className="flex -space-x-3">
                {["AC", "MB", "PS", "DO"].map((i, idx) => (
                  <div
                    key={i}
                    className="grid place-items-center size-9 rounded-full ring-2 ring-background bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-xs font-semibold"
                    style={{ zIndex: 10 - idx }}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                  <span className="ml-1 font-semibold text-foreground">4.9</span>
                </div>
                <p className="text-muted-foreground text-xs mt-0.5">
                  trusted by 2,400+ homes & businesses
                </p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — layered showcase */}
          <div className="lg:col-span-6 relative h-[520px] sm:h-[580px] lg:h-[640px]">
            {/* Central premium card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-6 sm:inset-10 rounded-3xl overflow-hidden shadow-lift bg-gradient-to-br from-foreground to-foreground/80"
            >
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="absolute -top-32 -right-32 size-72 rounded-full bg-accent/40 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-secondary/30 blur-3xl" />

              <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-end text-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-accent" />
                    <span className="text-xs uppercase tracking-widest text-white/70">Fully Insured · SLA Backed</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-display font-semibold leading-tight">
                    One team. <br />
                    Every service your property needs.
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { v: "12+", l: "Service lines" },
                      { v: "24/7", l: "Support" },
                      { v: "98%", l: "Retention" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-3">
                        <div className="text-lg font-semibold">{s.v}</div>
                        <div className="text-[11px] text-white/60">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating badges */}
            {FLOATING_BADGES.map((b, idx) => (
              <FloatingBadge key={b.label} {...b} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingBadge({
  label,
  icon: Icon,
  className,
  delay,
  index,
}: {
  label: string;
  icon: typeof Shirt;
  className: string;
  delay: number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4 + index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
        className="flex items-center gap-2.5 rounded-full bg-white border border-border/70 px-4 py-2.5 shadow-lift backdrop-blur"
      >
        <span className="grid place-items-center size-8 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 text-accent">
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-medium text-foreground pr-1">{label}</span>
      </motion.div>
    </motion.div>
  );
}
