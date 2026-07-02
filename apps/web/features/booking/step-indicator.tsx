"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  steps: string[];
  current: number;
};

export function StepIndicator({ steps, current }: Props) {
  return (
    <ol className="flex items-center w-full gap-2 sm:gap-3">
      {steps.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <li key={label} className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "grid place-items-center size-7 sm:size-8 rounded-full text-xs font-semibold transition-colors shrink-0",
                  isDone && "bg-accent text-white",
                  isActive && "bg-foreground text-white",
                  !isDone && !isActive && "bg-foreground/5 text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-4" /> : i + 1}
              </div>
              <div className="relative flex-1 h-1 rounded-full bg-foreground/5 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: isDone ? "100%" : isActive ? "50%" : "0%" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 bg-accent"
                />
              </div>
            </div>
            <span
              className={cn(
                "text-[11px] sm:text-xs font-medium hidden sm:block",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
