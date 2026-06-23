import Link from 'next/link';

const NAV = [
  { href: '/staff', label: 'Dashboard' },
  { href: '/staff/orders/new', label: '+ New order' },
  { href: '/staff/orders', label: 'Orders' },
  { href: '/staff/customers', label: 'Customers' },
  { href: '/staff/balances', label: 'Unpaid balances' },
  { href: '/staff/notifications', label: 'Notifications' },
  { href: '/staff/reports', label: 'End-of-day report' },
  { href: '/staff/catalog', label: 'Catalog' },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[14rem_1fr] bg-slate-100 print:block print:bg-white">
      <aside className="border-r border-slate-200 bg-white p-4 print:hidden">
        <Link href="/staff" className="mb-6 block text-lg font-semibold tracking-tight text-brand">
          Lynq · Staff
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 hover:bg-slate-100 hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-6 print:p-0">{children}</main>
    </div>
  );
}
