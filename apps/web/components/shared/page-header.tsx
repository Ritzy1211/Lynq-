import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, children, className }: Props) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full bg-radial-fade opacity-50" />
        <div className="absolute inset-0 grid-bg mask-fade-b opacity-50" />
      </div>
      <div className="container-wide pt-12 lg:pt-20 pb-16 lg:pb-24">
        <div className="max-w-3xl">
          {eyebrow && (
            <span className="pill-accent">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-6 heading-hero">{title}</h1>
          {description && <p className="mt-6 body-lg max-w-2xl">{description}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
