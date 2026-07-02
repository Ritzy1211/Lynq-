export type PortfolioProject = {
  slug: string;
  title: string;
  category: string;
  scope: string;
  metric: string;
  description: string;
  gradient: string;
};

export const PORTFOLIO: PortfolioProject[] = [
  {
    slug: "vertex-hq",
    title: "Vertex Studios — Corporate HQ",
    category: "Office Cleaning",
    scope: "4 floors · 28,000 sq ft · 5x weekly",
    metric: "99.4% SLA",
    description:
      "Transitioned a multi-vendor program into a single nightly cleaning contract with measurable quality KPIs.",
    gradient: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
  },
  {
    slug: "lumen-clinics",
    title: "Lumen Health — 5 Clinics",
    category: "Facility Management",
    scope: "5 sites · daily clean + quarterly fumigation",
    metric: "0 compliance issues",
    description:
      "Integrated cleaning, fumigation and waste under one SLA across five medical facilities.",
    gradient: "from-violet-500/20 via-fuchsia-500/10 to-pink-500/20",
  },
  {
    slug: "crestwood-residences",
    title: "Crestwood Residences",
    category: "Estate Maintenance",
    scope: "12 buildings · 220 units",
    metric: "4.9★ resident rating",
    description:
      "Full estate package — common-area cleaning, pressure washing, grounds, fumigation and waste.",
    gradient: "from-amber-500/20 via-orange-500/10 to-rose-500/20",
  },
  {
    slug: "atelier-maison",
    title: "Atelier Maison Boutique",
    category: "Deep & Garment Care",
    scope: "Weekly deep + on-call garment care",
    metric: "12-hour turnaround",
    description:
      "Studio resets after every photoshoot plus dedicated garment care for the in-house wardrobe team.",
    gradient: "from-cyan-500/20 via-sky-500/10 to-indigo-500/20",
  },
  {
    slug: "hilltop-restoration",
    title: "Hilltop Façade Restoration",
    category: "Pressure Washing",
    scope: "1,200 m² façade · 3-day program",
    metric: "20 yrs of buildup removed",
    description:
      "Soft-wash restoration of a 1990s mixed-use building façade and surrounding hardscape.",
    gradient: "from-slate-500/20 via-zinc-500/10 to-stone-500/20",
  },
  {
    slug: "summit-construction",
    title: "Summit Tower Handover",
    category: "Post Construction",
    scope: "18 floors · 3-phase clean",
    metric: "Move-in ready in 6 days",
    description:
      "Three-phase post-construction cleaning program completed in time for a phased tenant handover.",
    gradient: "from-emerald-500/20 via-lime-500/10 to-amber-500/20",
  },
];
