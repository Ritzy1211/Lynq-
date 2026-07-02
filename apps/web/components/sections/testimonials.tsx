"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/constants/testimonials";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const ACCENT_BG: Record<string, string> = {
  emerald: "from-emerald-400 to-teal-500",
  cyan: "from-cyan-400 to-sky-500",
  violet: "from-violet-400 to-fuchsia-500",
};

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const t = TESTIMONIALS[index];

  const next = () => setIndex((i) => (i + 1) % TESTIMONIALS.length);
  const prev = () => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="section-padding">
      <div className="container-wide">
        <SectionHeading
          eyebrow="Customer stories"
          title={<>Trusted by people who <span className="gradient-text">demand more</span>.</>}
          description="From corporate HQs to historic estates — the standard never changes."
          className="mb-16"
        />

        <div className="relative max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-border/70 bg-card p-8 sm:p-12 lg:p-16 shadow-soft overflow-hidden">
            <Quote className="absolute top-8 right-8 size-16 text-accent/10" />
            <div className="absolute -top-32 -left-20 size-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="flex items-center gap-1 text-amber-500 mb-6">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>

                <blockquote className="font-display text-2xl sm:text-3xl leading-snug text-foreground tracking-tight">
                  “{t.quote}”
                </blockquote>

                <div className="mt-8 flex items-center gap-4">
                  <div
                    className={cn(
                      "grid place-items-center size-14 rounded-2xl bg-gradient-to-br text-white font-semibold",
                      ACCENT_BG[t.accent],
                    )}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.role}, {t.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-8 bg-foreground" : "w-1.5 bg-foreground/20 hover:bg-foreground/40",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="grid place-items-center size-11 rounded-full border border-border/70 bg-white hover:bg-foreground hover:text-white transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="grid place-items-center size-11 rounded-full border border-border/70 bg-white hover:bg-foreground hover:text-white transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
