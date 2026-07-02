export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  initials: string;
  accent: "emerald" | "cyan" | "violet";
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Amelia Carter",
    role: "Director of Operations",
    company: "Vertex Studios",
    quote:
      "TotalCare took over our four-floor HQ cleaning contract and the difference was immediate. SLA-backed, discreet, and the team genuinely cares.",
    rating: 5,
    initials: "AC",
    accent: "emerald",
  },
  {
    name: "Marcus Bennett",
    role: "Homeowner",
    company: "Hilltop Estates",
    quote:
      "Bi-weekly home cleaning plus laundry pickup. It's the single best subscription I pay for. Same crew, same standard, every time.",
    rating: 5,
    initials: "MB",
    accent: "cyan",
  },
  {
    name: "Priya Shah",
    role: "Facilities Lead",
    company: "Lumen Health Group",
    quote:
      "Cleaning, fumigation and waste management across five clinics under one contract. Our compliance audits have never been smoother.",
    rating: 5,
    initials: "PS",
    accent: "violet",
  },
  {
    name: "Daniel Okoro",
    role: "Property Manager",
    company: "Crestwood Residences",
    quote:
      "Pressure washing brought our 1990s façade back to life. Their estate maintenance team now handles all twelve buildings.",
    rating: 5,
    initials: "DO",
    accent: "emerald",
  },
  {
    name: "Sophie Laurent",
    role: "Founder",
    company: "Atelier Maison",
    quote:
      "From garment care to deep cleans after every photoshoot — they understand premium service. Polished, punctual, professional.",
    rating: 5,
    initials: "SL",
    accent: "cyan",
  },
];
