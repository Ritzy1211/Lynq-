export type PricingPlan = {
  name: string;
  tagline: string;
  price: number;
  unit: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  accent: "slate" | "emerald" | "violet";
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Essential",
    tagline: "On-demand cleaning for everyday spaces.",
    price: 89,
    unit: "/ visit",
    features: [
      "Up to 1,500 sq ft",
      "Standard cleaning checklist",
      "Eco-friendly products",
      "Online scheduling",
      "Satisfaction guarantee",
    ],
    cta: "Book Essential",
    accent: "slate",
  },
  {
    name: "Premium Care",
    tagline: "Recurring service for homes that demand consistency.",
    price: 149,
    unit: "/ visit",
    features: [
      "Up to 3,500 sq ft",
      "Dedicated cleaning team",
      "Deep clean every 4th visit",
      "Laundry pickup included",
      "Priority scheduling",
      "Same-day support",
    ],
    cta: "Start Premium",
    highlight: true,
    accent: "emerald",
  },
  {
    name: "Estate & Facility",
    tagline: "Integrated facility, estate and contract programs.",
    price: 1499,
    unit: "/ month",
    features: [
      "Multi-site coordination",
      "SLA-backed performance",
      "Dedicated account manager",
      "Fumigation & waste included",
      "Monthly performance reports",
      "Custom service scope",
    ],
    cta: "Talk to Sales",
    accent: "violet",
  },
];
