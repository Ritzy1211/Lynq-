import Link from 'next/link';
import { api } from '../lib/api';
import { formatNgn } from '../lib/format';

interface OrderListItem {
  id: string;
  number: string;
  status: string;
  totalKobo: number;
  paidKobo: number;
  createdAt: string;
  customer: { id: string; fullName: string; phone: string } | null;
}

interface CustomerListItem {
  id: string;
  unpaidBalanceKobo: number;
}

interface OrdersResponse {
  items: OrderListItem[];
  nextCursor: string | null;
}

export const dynamic = 'force-dynamic';

export default async function StaffHome() {
  const [ordersRes, customers] = await Promise.all([
    api
      .get<OrdersResponse>('/orders?limit=100')
      .catch(() => ({ items: [] as OrderListItem[], nextCursor: null })),
    api.get<CustomerListItem[]>('/customers').catch(() => [] as CustomerListItem[]),
  ]);
  const orders = ordersRes.items;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysOrders = orders.filter((o) => new Date(o.createdAt) >= today);
  const ready = orders.filter((o) => o.status === 'ready');
  const inProgress = orders.filter((o) => o.status === 'washing' || o.status === 'ironing');
  const outstanding = customers.reduce((sum, c) => sum + (c.unpaidBalanceKobo ?? 0), 0);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Today at the shop</h1>
          <p className="mt-1 text-sm text-slate-600">A quick view of what needs attention right now.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/staff/reports"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            End-of-day
          </Link>
          <Link
            href="/staff/orders/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-dark"
          >
            + New order
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders today" value={todaysOrders.length.toString()} href="/staff/orders" />
        <Stat label="In progress" value={inProgress.length.toString()} href="/staff/orders?status=washing" />
        <Stat label="Ready for pickup" value={ready.length.toString()} href="/staff/orders?status=ready" highlight />
        <Stat label="Unpaid balances" value={formatNgn(outstanding)} href="/staff/balances" />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent orders</h2>
          <Link href="/staff/orders" className="text-sm text-brand hover:underline">
            See all
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No orders yet - create your first one to get started.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {orders.slice(0, 8).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/staff/orders/${o.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
                >
                  <div>
                    <div className="font-medium">{o.number}</div>
                    <div className="text-xs text-slate-500">{o.customer?.fullName ?? 'Walk-in'}</div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {o.status}
                    </span>
                    <span className="font-mono text-slate-800">{formatNgn(o.totalKobo)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border bg-white p-5 transition-shadow hover:shadow-sm ${
        highlight ? 'border-emerald-300' : 'border-slate-200'
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>
        {value}
      </div>
    </Link>
  );
}
