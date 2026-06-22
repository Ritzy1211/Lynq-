'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '@lynq/types';
import { swrFetcher } from '../../lib/api';
import { formatDateTime, formatNgn, statusBadgeClass } from '../../lib/format';

interface OrderRow {
  id: string;
  number: string;
  status: OrderStatus;
  totalKobo: number;
  paidKobo: number;
  paymentStatus: string;
  createdAt: string;
  customer: { id: string; fullName: string; phone: string } | null;
  items: Array<{ id: string; quantity: number }>;
}

interface ListResponse {
  items: OrderRow[];
  nextCursor: string | null;
}

type PaymentFilter = 'all' | 'paid' | 'unpaid';

export default function OrdersListPage() {
  const router = useRouter();
  const search = useSearchParams();

  // URL is the source of truth so filters are bookmarkable / shareable.
  const status = (search.get('status') as OrderStatus | null) ?? null;
  const q = search.get('q') ?? '';
  const from = search.get('from') ?? '';
  const to = search.get('to') ?? '';
  const payment = ((search.get('payment') as PaymentFilter | null) ?? 'all') as PaymentFilter;

  const [searchInput, setSearchInput] = useState(q);
  // Keep the input in sync if the URL changes from outside (Back/Forward).
  useEffect(() => setSearchInput(q), [q]);

  const apiQs = useMemo(() => {
    const p = new URLSearchParams();
    if (status) p.set('status', status);
    if (q) p.set('q', q);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    if (payment !== 'all') p.set('payment', payment);
    p.set('limit', '100');
    return p.toString();
  }, [status, q, from, to, payment]);

  const { data, isLoading, error, mutate } = useSWR<ListResponse>(
    `/orders?${apiQs}`,
    swrFetcher,
    { keepPreviousData: true, refreshInterval: 15_000 },
  );

  function updateFilters(patch: Record<string, string | null>) {
    const next = new URLSearchParams(search.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.replace(qs ? `/staff/orders?${qs}` : '/staff/orders');
  }

  // Debounce the free-text search.
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  function onSearchChange(value: string) {
    setSearchInput(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => updateFilters({ q: value.trim() || null }), 300);
  }

  const activeFilterCount =
    (status ? 1 : 0) + (q ? 1 : 0) + (from ? 1 : 0) + (to ? 1 : 0) + (payment !== 'all' ? 1 : 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Search, filter by status, date or payment.
          </p>
        </div>
        <Link
          href="/staff/orders/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + New order
        </Link>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by LYNQ-0001, customer name or phone"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <DateInput
            label="From"
            value={from}
            onChange={(v) => updateFilters({ from: v || null })}
          />
          <DateInput
            label="To"
            value={to}
            onChange={(v) => updateFilters({ to: v || null })}
          />
          <select
            value={payment}
            onChange={(e) => updateFilters({ payment: e.target.value === 'all' ? null : e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="all">Any payment</option>
            <option value="paid">Paid in full</option>
            <option value="unpaid">Unpaid / partial</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FilterChip
            label="All statuses"
            active={status === null}
            onClick={() => updateFilters({ status: null })}
          />
          {ORDER_STATUSES.map((s) => (
            <FilterChip
              key={s}
              label={ORDER_STATUS_LABELS[s]}
              active={status === s}
              onClick={() => updateFilters({ status: status === s ? null : s })}
            />
          ))}
          {activeFilterCount > 0 && (
            <button
              onClick={() =>
                updateFilters({ status: null, q: null, from: null, to: null, payment: null })
              }
              className="ml-auto text-xs text-slate-500 underline hover:text-slate-700"
            >
              Clear all
            </button>
          )}
        </div>
      </section>

      <div className="rounded-lg border border-slate-200 bg-white">
        {error ? (
          <div className="p-6 text-sm text-rose-700">Could not load orders.</div>
        ) : isLoading && !data ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No orders match these filters.
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Order</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Items</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Owed</th>
                  <th className="px-4 py-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((o) => {
                  const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
                  const owed = Math.max(0, o.totalKobo - o.paidKobo);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/staff/orders/${o.id}`}
                          className="font-medium text-brand-dark hover:underline"
                        >
                          {o.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {o.customer ? (
                          <div>
                            <Link
                              href={`/staff/customers/${o.customer.id}`}
                              className="hover:underline"
                            >
                              {o.customer.fullName}
                            </Link>
                            <div className="font-mono text-xs text-slate-500">{o.customer.phone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Walk-in</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${statusBadgeClass(o.status)}`}
                        >
                          {ORDER_STATUS_LABELS[o.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{itemCount}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatNgn(o.totalKobo)}</td>
                      <td
                        className={`px-4 py-3 text-right ${owed > 0 ? 'font-medium text-rose-700' : 'text-slate-400'}`}
                      >
                        {owed > 0 ? formatNgn(owed) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDateTime(o.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              <span>
                Showing {data.items.length} order{data.items.length === 1 ? '' : 's'}
                {data.nextCursor ? ' (more available)' : ''}
              </span>
              {data.nextCursor && (
                <button
                  onClick={() =>
                    mutate(
                      (curr) => curr,
                      { revalidate: true },
                    )
                  }
                  className="text-brand hover:underline"
                  // Pagination v1: surface that more exist; full cursor paging
                  // can come later via "Load more" appending pages in state.
                  disabled
                  title="Refine filters to see more"
                >
                  Refine to see more
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      <span className="whitespace-nowrap">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-800 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
    </label>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
        active
          ? 'bg-brand text-white ring-brand'
          : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}
