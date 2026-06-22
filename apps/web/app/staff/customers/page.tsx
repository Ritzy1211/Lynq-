'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { swrFetcher } from '../../lib/api';
import { formatNgn } from '../../lib/format';

interface CustomerRow {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  ordersCount: number;
  totalSpentKobo: number;
  unpaidBalanceKobo: number;
}

export default function CustomersPage() {
  const [q, setQ] = useState('');
  const { data, isLoading, error } = useSWR<CustomerRow[]>(
    `/customers${q ? `?search=${encodeURIComponent(q)}` : ''}`,
    swrFetcher,
    { keepPreviousData: true },
  );

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="mt-1 text-sm text-slate-600">Phone numbers, addresses, history and balances.</p>
        </div>
        <Link
          href="/staff/customers/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-dark"
        >
          + Register customer
        </Link>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-3">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-700">Could not load customers: {String(error.message ?? error)}</div>
        ) : isLoading ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : !data || data.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No customers yet. Use “Register customer” to add the first one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2 text-right">Orders</th>
                <th className="px-4 py-2 text-right">Balance owed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/staff/customers/${c.id}`} className="font-medium text-brand-dark hover:underline">
                      {c.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{c.address ?? '—'}</td>
                  <td className="px-4 py-3 text-right">{c.ordersCount}</td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      c.unpaidBalanceKobo > 0 ? 'text-rose-700' : 'text-slate-500'
                    }`}
                  >
                    {c.unpaidBalanceKobo > 0 ? formatNgn(c.unpaidBalanceKobo) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
