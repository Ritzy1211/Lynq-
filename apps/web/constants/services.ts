import {
  Shirt,
  Home,
  Building2,
  Bug,
  Trees,
  Wrench,
  Droplets,
  Truck,
  Recycle,
  Hammer,
  Sparkles,
  HandPlatter,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  features: string[];
  startingPrice: number;
  unit: string;
  accent: "emerald" | "cyan" | "violet" | "amber" | "rose" | "slate";
  popular?: boolean;
};

export const SERVICES: Service[] = [
  {
    slug: "laundry",
    title: "Laundry & Dry Cleaning",
    shortTitle: "Laundry",
    description:
      "Premium garment care with pickup & delivery — washed, pressed, perfect.",
    longDescription:
      "From everyday loads to delicate dry cleaning, we handle every garment with precision care. Free pickup & delivery, eco-friendly detergents, and 24-hour turnaround on most orders.",
    icon: Shirt,
    features: [
      "Free pickup & delivery",
      "Wash, dry & fold service",
      "Dry cleaning specialists",
      "24-hour turnaround",
      "Eco-friendly detergents",
      "Stain treatment included",
    ],
    startingPrice: 19,
    unit: "per load",
    accent: "cyan",
    popular: true,
  },
  {
    slug: "home-cleaning",
    title: "Home Cleaning",
    shortTitle: "Home",
    description:
      "Recurring or one-time deep cleans that leave every room spotless.",
    longDescription:
      "Trained, vetted home cleaning professionals using premium products. Weekly, bi-weekly, monthly or one-off cleans — fully insured and 100% satisfaction guaranteed.",
    icon: Home,
    features: [
      "Vetted, insured cleaners",
      "Weekly / bi-weekly / monthly",
      "Eco-friendly products",
      "Custom cleaning checklists",
      "Same-day availability",
      "100% satisfaction guarantee",
    ],
    startingPrice: 89,
    unit: "per visit",
    accent: "emerald",
    popular: true,
  },
  {
    slug: "office-cleaning",
    title: "Office Cleaning",
    shortTitle: "Office",
    description:
      "Discreet, scheduled commercial cleaning that keeps workspaces pristine.",
    longDescription:
      "Custom commercial cleaning programs for offices, co-working spaces and corporate HQs. After-hours service, COI-compliant, with dedicated account managers.",
    icon: Building2,
    features: [
      "After-hours service",
      "Dedicated account manager",
      "COI & insurance documentation",
      "Sustainable products",
      "Restroom & kitchen sanitization",
      "Window & glass care",
    ],
    startingPrice: 249,
    unit: "per visit",
    accent: "violet",
  },
  {
    slug: "fumigation",
    title: "Fumigation & Pest Control",
    shortTitle: "Fumigation",
    description:
      "Licensed pest control with safe, residential-grade treatments.",
    longDescription:
      "Integrated pest management for homes, estates and commercial properties. Roaches, rodents, termites, bedbugs and seasonal pests handled with EPA-approved methods.",
    icon: Bug,
    features: [
      "Licensed technicians",
      "EPA-approved chemicals",
      "Pet & child safe options",
      "Quarterly maintenance plans",
      "Termite & rodent control",
      "Pre & post-treatment reports",
    ],
    startingPrice: 159,
    unit: "per treatment",
    accent: "amber",
  },
  {
    slug: "estate-maintenance",
    title: "Estate Maintenance",
    shortTitle: "Estate",
    description:
      "Concierge-level grounds, garden and exterior care for fine residences.",
    longDescription:
      "Year-round maintenance for private estates — lawn, garden, pool, hedges, seasonal cleanups and exterior detailing — managed by a single dedicated team.",
    icon: Trees,
    features: [
      "Year-round grounds care",
      "Garden & hedge detailing",
      "Pool & water feature service",
      "Seasonal property prep",
      "Single dedicated team",
      "Discreet, vetted staff",
    ],
    startingPrice: 399,
    unit: "per month",
    accent: "emerald",
  },
  {
    slug: "facility-management",
    title: "Facility Management",
    shortTitle: "Facility",
    description:
      "End-to-end facility operations for corporate and multi-site clients.",
    longDescription:
      "Integrated facility services — cleaning, maintenance, waste, pest control and vendor coordination — delivered under one accountable SLA-backed contract.",
    icon: Wrench,
    features: [
      "SLA-backed contracts",
      "Single point of contact",
      "Multi-site coordination",
      "Preventive maintenance",
      "Vendor management",
      "Monthly performance reporting",
    ],
    startingPrice: 1499,
    unit: "per month",
    accent: "slate",
  },
  {
    slug: "pressure-washing",
    title: "Pressure Washing",
    shortTitle: "Pressure Wash",
    description:
      "High-impact exterior restoration for driveways, facades and decks.",
    longDescription:
      "Commercial-grade pressure washing for driveways, sidewalks, decks, patios and building facades. Removes mold, grime, oil and years of buildup safely.",
    icon: Droplets,
    features: [
      "Soft-wash & high-pressure",
      "Driveway & sidewalk restore",
      "Facade & siding cleaning",
      "Deck & patio revival",
      "Eco-safe detergents",
      "Same-day quotes",
    ],
    startingPrice: 199,
    unit: "per job",
    accent: "cyan",
  },
];

// Extra service categories shown elsewhere on the site
export const EXTENDED_SERVICES = [
  { title: "Deep Cleaning", icon: Sparkles },
  { title: "Post Construction", icon: Hammer },
  { title: "Pickup & Delivery", icon: Truck },
  { title: "Waste Management", icon: Recycle },
  { title: "Corporate Contracts", icon: HandPlatter },
] as const;

export const SERVICE_ACCENT_CLASSES: Record<
  Service["accent"],
  { ring: string; bg: string; text: string; border: string; glow: string }
> = {
  emerald: {
    ring: "ring-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    border: "border-emerald-500/20",
    glow: "shadow-[0_30px_80px_-30px_rgba(16,185,129,0.45)]",
  },
  cyan: {
    ring: "ring-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-600",
    border: "border-cyan-500/20",
    glow: "shadow-[0_30px_80px_-30px_rgba(6,182,212,0.45)]",
  },
  violet: {
    ring: "ring-violet-500/30",
    bg: "bg-violet-500/10",
    text: "text-violet-600",
    border: "border-violet-500/20",
    glow: "shadow-[0_30px_80px_-30px_rgba(139,92,246,0.45)]",
  },
  amber: {
    ring: "ring-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-amber-500/20",
    glow: "shadow-[0_30px_80px_-30px_rgba(245,158,11,0.45)]",
  },
  rose: {
    ring: "ring-rose-500/30",
    bg: "bg-rose-500/10",
    text: "text-rose-600",
    border: "border-rose-500/20",
    glow: "shadow-[0_30px_80px_-30px_rgba(244,63,94,0.45)]",
  },
  slate: {
    ring: "ring-slate-500/30",
    bg: "bg-slate-500/10",
    text: "text-slate-700",
    border: "border-slate-500/20",
    glow: "shadow-[0_30px_80px_-30px_rgba(71,85,105,0.45)]",
  },
};

export function getServiceBySlug(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}
