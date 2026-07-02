import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SITE } from '@/constants/site';

/**
 * Layout for the public marketing site (TotalCare landing). Wraps every route
 * in the (marketing) group with Navbar + Footer and the LocalBusiness JSON-LD.
 *
 * Staff / admin / receipts / API-facing routes live outside this group and are
 * unaffected.
 */

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE.legalName,
  description: SITE.description,
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address,
  },
  sameAs: Object.values(SITE.social),
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-foreground focus:text-white focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="pt-28">
        {children}
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
