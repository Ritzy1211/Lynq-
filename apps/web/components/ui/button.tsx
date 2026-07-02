import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 group/btn",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-soft hover:shadow-lift hover:-translate-y-0.5",
        accent:
          "bg-accent text-accent-foreground shadow-glow hover:shadow-[0_24px_70px_-20px_rgba(16,185,129,0.7)] hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:shadow-lift hover:-translate-y-0.5",
        outline:
          "border border-foreground/15 bg-white/70 backdrop-blur text-foreground hover:bg-white hover:border-foreground/30",
        ghost:
          "text-foreground hover:bg-foreground/5",
        glass:
          "border border-white/40 bg-white/20 backdrop-blur-xl text-foreground hover:bg-white/40",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-7 text-base",
        xl: "h-16 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
