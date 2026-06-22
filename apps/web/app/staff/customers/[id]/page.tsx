import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, ApiError } from '../../../lib/api';
import { formatDateTime, formatNgn, statusBadgeClass } from '../../../lib/format';
import type { OrderStatus } from '@lynq/types';

interface CustomerDetail {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  ordersCount: number;
  totalSpentKobo: number;
  unpaidBalanceKobo: number;
  orders: Array<{
    id: string;
    number: string;
    status: OrderStatus;
    totalKobo: number;
    paidKobo: number;
    createdAt: string;
    items: Array<{ id: string; quantity: number }>;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let customer: CustomerDetail;
  try {
    customer = await api.get<CustomerDetail>(`/customers/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="space-y-6">
      <Link href="/staff/customers" className="text-sm text-brand hover:underline">
        ← All customers
      </Link>

      <header className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{customer.fullName}</h1>
            <div className="mt-1 space-y-0.5 text-sm text-slate-600">
              <div>📞 <span className="font-mono">{customer.phone}</span></div>
              {customer.address && <div>📍 {customer.address}</div>}
              {customer.email && <div>✉️ {customer.email}</div>}
            </div>
            {customer.notes && <p className="mt-3 max-w-xl text-sm italic text-slate-500">“{customer.notes}”</p>}
          </div>
          <Link
            href={`/staff/orders/new?customerId=${customer.id}`}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            + New order
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
          <Stat label="Orders" value={customer.ordersCount.toString()} />
          <Stat label="Total spent" value={formatNgn(customer.totalSpentKobo)} />
          <Stat
            label="Unpaid balance"
            value={formatNgn(customer.unpaidBalanceKobo)}
            tone={customer.unpaidBalanceKobo > 0 ? 'warn' : 'ok'}
          />
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Order history</h2>
        </div>
        {customer.orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">No orders yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {customer.orders.map((o) => {
              const owing = o.totalKobo - o.paidKobo;
              return (
                <li key={o.id}>
                  <Link href={`/staff/orders/${o.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                    <div>
                      <div className="font-medium">{o.number}</div>
                      <div className="text-xs text-slate-500">
                        {formatDateTime(o.createdAt)} · {o.items.length} item{o.items.length === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${statusBadgeClass(o.status)}`}>
                        {o.status}
                      </span>
                      <div className="text-right">
                        <div className="font-mono">{formatNgn(o.totalKobo)}</div>
                        {owing > 0 && <div className="text-xs text-rose-600">owes {formatNgn(owing)}</div>}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  const color = tone === 'warn' ? 'text-rose-700' : 'text-slate-900';
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
