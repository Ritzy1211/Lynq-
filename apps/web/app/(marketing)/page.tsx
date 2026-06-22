import Link from 'next/link';

export default function MarketingHome() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 flex items-center justify-between">
        <span className="text-2xl font-semibold tracking-tight text-brand">Lynq</span>
        <nav className="flex gap-4 text-sm">
          <Link className="hover:text-brand" href="/services">
            Services
          </Link>
          <Link className="hover:text-brand" href="/book">
            Book pickup
          </Link>
          <Link className="hover:text-brand" href="/track">
            Track order
          </Link>
          <Link className="rounded bg-brand px-3 py-1.5 text-white hover:bg-brand-dark" href="/staff">
            Staff sign-in
          </Link>
        </nav>
      </header>

      <section className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Laundry & dry cleaning, the modern way.
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Schedule a pickup, track every garment from wash to ready, and pay with card, transfer or
            mobile money — all without calling the front desk.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/book"
              className="rounded-lg bg-brand px-5 py-3 font-medium text-white hover:bg-brand-dark"
            >
              Book a pickup
            </Link>
            <Link
              href="/track"
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium hover:border-brand hover:text-brand"
            >
              Track an order
            </Link>
          </div>
        </div>
        <ul className="space-y-3 text-sm text-slate-700">
          {[
            'Itemised pricing — wash, dry-clean, ironing per garment.',
            'QR-tagged garments — nothing goes missing.',
            'Live status: received → washing → ready → delivered.',
            'WhatsApp & SMS updates at every step.',
            'Pay with Paystack: card, transfer, USSD, or POS at the counter.',
          ].map((line) => (
            <li key={line} className="rounded-md bg-white p-4 shadow-sm">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-16 border-t pt-6 text-sm text-slate-500">
        © {new Date().getFullYear()} Lynq. Made in Lagos.
      </footer>
    </main>
  );
}
