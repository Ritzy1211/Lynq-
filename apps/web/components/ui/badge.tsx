import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-foreground/5 text-foreground/80 border border-foreground/10",
        accent: "bg-accent/10 text-accent border border-accent/20",
        secondary: "bg-secondary/10 text-secondary border border-secondary/20",
        outline: "border border-border/70 text-muted-foreground bg-white/60 backdrop-blur",
        dark: "bg-foreground text-primary-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
