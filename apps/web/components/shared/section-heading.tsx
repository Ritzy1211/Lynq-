import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center max-w-2xl mx-auto" : "items-start text-left max-w-2xl",
        className,
      )}
    >
      {eyebrow && (
        <span className="pill-accent">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          {eyebrow}
        </span>
      )}
      <h2 className="heading-xl">{title}</h2>
      {description && <p className="body-lg">{description}</p>}
    </div>
  );
}
