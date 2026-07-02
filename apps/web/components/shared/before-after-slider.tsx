"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  /** Before image gradient class (Tailwind from-*  to-*). */
  beforeGradient: string;
  /** After image gradient class (Tailwind from-* to-*). */
  afterGradient: string;
};

export function BeforeAfterSlider({
  beforeLabel = "Before",
  afterLabel = "After",
  className,
  beforeGradient,
  afterGradient,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePos = useCallback((clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, x)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => updatePos(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, updatePos]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border/70 bg-foreground/5 select-none touch-none cursor-ew-resize",
        className,
      )}
      onPointerDown={(e) => {
        setDragging(true);
        updatePos(e.clientX);
      }}
    >
      {/* AFTER (base) */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          afterGradient,
        )}
      >
        <div className="absolute inset-0 grid-bg opacity-40" />
        <span className="absolute bottom-4 right-4 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-semibold text-foreground shadow-soft">
          {afterLabel}
        </span>
      </div>

      {/* BEFORE (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br h-full",
            beforeGradient,
          )}
          style={{ width: `${(100 / pos) * 100}%` }}
        >
          <div className="absolute inset-0 noise opacity-30" />
          <span className="absolute bottom-4 left-4 rounded-full bg-foreground/90 text-white backdrop-blur px-3 py-1 text-xs font-semibold shadow-soft">
            {beforeLabel}
          </span>
        </div>
      </div>

      {/* Handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-px bg-white shadow-[0_0_24px_rgba(255,255,255,0.6)]"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center size-12 rounded-full bg-white text-foreground shadow-lift ring-1 ring-foreground/10">
          <GripVertical className="size-5" />
        </div>
      </motion.div>
    </div>
  );
}
