import { Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  tone?: "dark" | "light";
};

export function Logo({ className, tone = "dark" }: Props) {
  return (
    <Link
      href="/"
      aria-label="TotalCare home"
      className={cn(
        "group inline-flex items-center gap-2.5 font-display font-semibold text-base tracking-tight",
        tone === "dark" ? "text-foreground" : "text-white",
        className,
      )}
    >
      <span className="relative grid place-items-center size-9 rounded-xl bg-gradient-to-br from-accent via-emerald-500 to-secondary text-white shadow-glow transition-transform group-hover:scale-105">
        <Sparkles className="size-4" strokeWidth={2.5} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />
      </span>
      <span className="flex items-baseline gap-0.5">
        Total<span className="text-accent">Care</span>
      </span>
    </Link>
  );
}
