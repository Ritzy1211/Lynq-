"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/constants/services";
import { formatCurrency, cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const SIZES = [
  { value: "small", label: "Small", multiplier: 1, hint: "< 1,000 sq ft" },
  { value: "medium", label: "Medium", multiplier: 1.6, hint: "1,000–2,500 sq ft" },
  { value: "large", label: "Large", multiplier: 2.4, hint: "2,500–5,000 sq ft" },
  { value: "xlarge", label: "X-Large", multiplier: 3.5, hint: "5,000+ sq ft" },
];

const FREQUENCIES = [
  { value: "onetime", label: "One-time", multiplier: 1 },
  { value: "monthly", label: "Monthly", multiplier: 0.92 },
  { value: "biweekly", label: "Bi-weekly", multiplier: 0.85 },
  { value: "weekly", label: "Weekly", multiplier: 0.78 },
];

const ADDONS = [
  { id: "deep", label: "Deep clean add-on", price: 79 },
  { id: "windows", label: "Interior windows", price: 39 },
  { id: "appliances", label: "Inside appliances", price: 49 },
  { id: "laundry", label: "Laundry pickup", price: 29 },
];

export function QuoteCalculator({ defaultService }: { defaultService?: string }) {
  const [serviceSlug, setServiceSlug] = useState(defaultService ?? SERVICES[1].slug);
  const [size, setSize] = useState("medium");
  const [frequency, setFrequency] = useState("biweekly");
  const [addons, setAddons] = useState<string[]>([]);

  const service = SERVICES.find((s) => s.slug === serviceSlug) ?? SERVICES[0];
  const sizeMul = SIZES.find((s) => s.value === size)?.multiplier ?? 1;
  const freqMul = FREQUENCIES.find((f) => f.value === frequency)?.multiplier ?? 1;
  const addonTotal = ADDONS.filter((a) => addons.includes(a.id)).reduce(
    (acc, a) => acc + a.price,
    0,
  );

  const total = useMemo(
    () => Math.round(service.startingPrice * sizeMul * freqMul + addonTotal),
    [service.startingPrice, sizeMul, freqMul, addonTotal],
  );

  const toggleAddon = (id: string) =>
    setAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
      {/* Left: inputs */}
      <div className="lg:col-span-3 rounded-3xl border border-border/70 bg-card p-8 shadow-soft space-y-8">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center size-11 rounded-2xl bg-accent/10 text-accent">
            <Calculator className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-semibold">Instant quote</h3>
            <p className="text-xs text-muted-foreground">Estimates update live · no email required</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Service</Label>
          <div className="grid sm:grid-cols-2 gap-2">
            {SERVICES.map((s) => (
              <button
                key={s.slug}
                onClick={() => setServiceSlug(s.slug)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                  serviceSlug === s.slug
                    ? "border-foreground bg-foreground/5"
                    : "border-border/70 hover:border-foreground/30 bg-white",
                )}
              >
                <span className="grid place-items-center size-9 rounded-xl bg-accent/10 text-accent shrink-0">
                  <s.icon className="size-4" />
                </span>
                <span className="text-sm font-medium">{s.shortTitle}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Property size</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition-all",
                  size === s.value
                    ? "border-foreground bg-foreground/5"
                    : "border-border/70 hover:border-foreground/30 bg-white",
                )}
              >
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Frequency</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={cn(
                  "rounded-2xl border p-3 text-sm font-medium transition-all",
                  frequency === f.value
                    ? "border-foreground bg-foreground/5"
                    : "border-border/70 hover:border-foreground/30 bg-white",
                )}
              >
                {f.label}
                {f.multiplier < 1 && (
                  <span className="ml-1.5 text-[10px] text-accent font-semibold">
                    −{Math.round((1 - f.multiplier) * 100)}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Add-ons</Label>
          <div className="grid sm:grid-cols-2 gap-2">
            {ADDONS.map((a) => {
              const active = addons.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAddon(a.id)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border p-3 text-left transition-all",
                    active
                      ? "border-accent bg-accent/5"
                      : "border-border/70 hover:border-foreground/30 bg-white",
                  )}
                >
                  <span className="text-sm font-medium">{a.label}</span>
                  <span className="text-xs font-mono text-muted-foreground">+${a.price}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: total */}
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-32 rounded-3xl bg-foreground text-white p-8 shadow-lift overflow-hidden relative">
          <div className="absolute -top-32 -right-20 size-72 rounded-full bg-accent/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-20 size-72 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-widest">
              <Sparkles className="size-3.5 text-accent" /> Estimated total
            </div>
            <motion.div
              key={total}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-3 font-display text-5xl sm:text-6xl font-semibold tracking-tight"
            >
              {formatCurrency(total)}
            </motion.div>
            <p className="mt-2 text-sm text-white/60">
              {service.title} · {SIZES.find((s) => s.value === size)?.label} ·{" "}
              {FREQUENCIES.find((f) => f.value === frequency)?.label.toLowerCase()}
            </p>

            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-center justify-between text-white/70">
                <span>Base rate</span>
                <span>${service.startingPrice}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Size multiplier</span>
                <span>×{sizeMul}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Frequency</span>
                <span>×{freqMul}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Add-ons</span>
                <span>+${addonTotal}</span>
              </div>
            </div>

            <Button asChild variant="accent" size="lg" className="w-full mt-8">
              <Link href={`/book?service=${serviceSlug}`}>
                Book this scope <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <p className="mt-3 text-[11px] text-white/50 text-center">
              Final pricing confirmed after a brief walkthrough.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
