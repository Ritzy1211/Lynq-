export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_LINKS = {
  services: [
    { label: "Laundry & Dry Cleaning", href: "/services/laundry" },
    { label: "Home Cleaning", href: "/services/home-cleaning" },
    { label: "Office Cleaning", href: "/services/office-cleaning" },
    { label: "Fumigation & Pest Control", href: "/services/fumigation" },
    { label: "Pressure Washing", href: "/services/pressure-washing" },
    { label: "Estate Maintenance", href: "/services/estate-maintenance" },
    { label: "Facility Management", href: "/services/facility-management" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Pricing", href: "/pricing" },
    { label: "Careers", href: "/about#careers" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "Book a Service", href: "/book" },
    { label: "Get a Quote", href: "/book?step=quote" },
    { label: "Help Center", href: "/contact" },
  ],
} as const;
