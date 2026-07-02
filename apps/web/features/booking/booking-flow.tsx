"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./step-indicator";
import {
  ServiceStep,
  LocationStep,
  ScheduleStep,
  UploadStep,
  ReviewStep,
  ConfirmationStep,
} from "./steps";
import { useBookingStore } from "./store";

const STEPS = ["Service", "Location", "Schedule", "Uploads", "Review", "Confirm"];

export function BookingFlow() {
  const [step, setStep] = useState(0);
  const params = useSearchParams();
  const { service, location, schedule, contact, setService } = useBookingStore();

  // Preselect service from URL
  useEffect(() => {
    const s = params.get("service");
    if (s && !service) setService(s);
  }, [params, service, setService]);

  const canAdvance = () => {
    switch (step) {
      case 0: return !!service;
      case 1: return !!location.address && !!location.postcode;
      case 2: return !!schedule.date && !!schedule.time;
      case 3: return true;
      case 4: return !!contact.name && !!contact.email;
      default: return true;
    }
  };

  const next = () => {
    if (!canAdvance()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="space-y-10">
      <StepIndicator steps={STEPS} current={step} />

      <div className="min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && <ServiceStep />}
            {step === 1 && <LocationStep />}
            {step === 2 && <ScheduleStep />}
            {step === 3 && <UploadStep />}
            {step === 4 && <ReviewStep />}
            {step === 5 && <ConfirmationStep />}
          </motion.div>
        </AnimatePresence>
      </div>

      {step < STEPS.length - 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-border/70">
          <Button
            variant="ghost"
            size="md"
            onClick={back}
            disabled={step === 0}
            className="disabled:opacity-40"
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          <div className="text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </div>
          <Button
            variant="accent"
            size="md"
            onClick={next}
            disabled={!canAdvance()}
          >
            {step === STEPS.length - 2 ? "Confirm booking" : "Continue"}{" "}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
