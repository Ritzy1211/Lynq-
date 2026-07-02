export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  date: string;
  author: { name: string; initials: string; role: string };
  cover: { gradient: string };
  content: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "deep-clean-vs-standard-clean",
    title: "Deep Clean vs. Standard Clean: What Your Space Actually Needs",
    excerpt:
      "Not every cleaning visit needs to dismantle your kitchen. Here's how to choose the right service for the right moment.",
    category: "Home Cleaning",
    readingTime: "6 min read",
    date: "2025-04-12",
    author: { name: "Amelia Carter", initials: "AC", role: "Service Lead" },
    cover: { gradient: "from-emerald-400 via-teal-400 to-cyan-400" },
    content: [
      "A standard clean is your maintenance layer — surfaces wiped, floors vacuumed, kitchens and bathrooms reset. A deep clean is restorative: grout, baseboards, behind appliances, inside cabinets.",
      "If you've never had a property professionally deep-cleaned, start there. After that, a bi-weekly standard clean is usually enough to keep the result.",
      "We build hybrid plans for most clients: a quarterly deep clean stacked on a recurring standard visit. It's the most cost-effective way to maintain a premium standard.",
    ],
  },
  {
    slug: "post-construction-checklist",
    title: "The Post-Construction Cleaning Checklist Contractors Don't Share",
    excerpt:
      "Dust migrates for weeks after a build. Here's the multi-phase cleaning sequence we use on every handover.",
    category: "Post Construction",
    readingTime: "8 min read",
    date: "2025-03-28",
    author: { name: "Marcus Bennett", initials: "MB", role: "Operations" },
    cover: { gradient: "from-amber-400 via-orange-400 to-rose-400" },
    content: [
      "Post-construction cleaning is three jobs in one: rough clean, detail clean, and final polish. Skipping a phase guarantees callbacks.",
      "We use HEPA vacuums, tack cloths and microfiber systems to capture drywall and silica dust at every level — ceilings, walls, fixtures, floors.",
      "By handover day, the property is ready for furniture, photos or move-in — no haze, no streaks, no lingering particulate.",
    ],
  },
  {
    slug: "year-round-pest-prevention",
    title: "Year-Round Pest Prevention for Properties",
    excerpt:
      "Reactive pest control is expensive. A quarterly program is how serious property owners stay ahead.",
    category: "Fumigation",
    readingTime: "5 min read",
    date: "2025-03-10",
    author: { name: "Priya Shah", initials: "PS", role: "Facilities" },
    cover: { gradient: "from-violet-400 via-fuchsia-400 to-pink-400" },
    content: [
      "Pests follow seasons. Winter brings rodents indoors, spring brings ants and termites, summer surfaces roaches and mosquitoes, fall is wasp and spider season.",
      "A four-visit annual program — one per season — is the lowest-cost way to keep a property pest-free. We document every treatment and adjust between visits.",
      "For multi-site portfolios, we coordinate access, reporting and compliance under a single account.",
    ],
  },
  {
    slug: "how-we-price-facility-contracts",
    title: "How We Price Facility Management Contracts",
    excerpt:
      "An honest look at the line items inside a multi-site cleaning and maintenance contract.",
    category: "Facility Management",
    readingTime: "9 min read",
    date: "2025-02-22",
    author: { name: "Daniel Okoro", initials: "DO", role: "Account Director" },
    cover: { gradient: "from-cyan-400 via-sky-400 to-indigo-400" },
    content: [
      "Facility contracts are built from four cost layers: labor hours, supplies, equipment amortization, and management overhead. Transparent providers itemize all four.",
      "We share a per-site scope-of-work document, frequency matrix and quality KPIs at proposal stage — so you can compare apples to apples.",
      "Most clients move to us after seeing their existing contract restructured into clearer line items. Visibility creates trust.",
    ],
  },
];
