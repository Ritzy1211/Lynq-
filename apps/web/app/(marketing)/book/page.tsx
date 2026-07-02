"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookingFlow } from "@/features/booking/booking-flow";
import { QuoteCalculator } from "@/features/quote/quote-calculator";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

function BookPageContent() {
  const params = useSearchParams();
  const mode = params.get("step") === "quote" ? "quote" : "book";
  const defaultService = params.get("service") ?? undefined;

  return (
    <>
      <PageHeader
        eyebrow={mode === "quote" ? "Instant quote" : "Book a service"}
        title={
          mode === "quote" ? (
            <>Get a <span className="gradient-text">live estimate</span> in 30 seconds.</>
          ) : (
            <>Book your service in <span className="gradient-text">six clean steps</span>.</>
          )
        }
        description={
          mode === "quote"
            ? "Choose a service, size and frequency — see your estimate update live. No email required."
            : "Pick the service, share location and schedule, upload references and confirm. We handle the rest."
        }
      >
        <div className="inline-flex rounded-full border border-border/70 bg-white p-1 shadow-subtle">
          <ModeTab href="/book" active={mode === "book"} label="Book service" />
          <ModeTab href="/book?step=quote" active={mode === "quote"} label="Instant quote" />
        </div>
      </PageHeader>

      <section className="container-wide pb-24">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {mode === "quote" ? (
            <QuoteCalculator defaultService={defaultService} />
          ) : (
            <BookingFlow />
          )}
        </motion.div>
      </section>
    </>
  );
}

function ModeTab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      className={cn(
        "px-5 h-9 inline-flex items-center rounded-full text-sm font-medium transition-colors",
        active ? "bg-foreground text-white" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </a>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookPageContent />
    </Suspense>
  );
}
