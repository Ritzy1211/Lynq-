'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { swrFetcher } from '../../lib/api';
import { formatNgn } from '../../lib/format';

interface UnpaidRow {
  customerId: string;
  totalKobo: number;
  paidKobo: number;
  unpaidBalanceKobo: number;
  customer: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
}

export default function BalancesPage() {
  const { data, isLoading, error } = useSWR<UnpaidRow[]>('/customers/balances/unpaid', swrFetcher);

  const totalOwed = data?.reduce((s, r) => s + r.unpaidBalanceKobo, 0) ?? 0;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Unpaid balances</h1>
        <p className="mt-1 text-sm text-slate-600">
          Customers with outstanding balances across their orders.
        </p>
      </header>

      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-rose-700">Total outstanding</div>
        <div className="mt-1 text-3xl font-semibold text-rose-800">{formatNgn(totalOwed)}</div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {error ? (
          <div className="p-6 text-sm text-rose-700">Could not load balances.</div>
        ) : isLoading ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : !data || data.length === 0 ? (
          <div className="p-10 text-center text-sm text-emerald-700">
            🎉 No outstanding balances. Everyone is paid up.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2 text-right">Billed</th>
                <th className="px-4 py-2 text-right">Paid</th>
                <th className="px-4 py-2 text-right">Owing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.customerId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {row.customer ? (
                      <Link href={`/staff/customers/${row.customer.id}`} className="font-medium text-brand-dark hover:underline">
                        {row.customer.fullName}
                      </Link>
                    ) : (
                      <span className="text-slate-400">(deleted)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.customer?.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatNgn(row.totalKobo)}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700">{formatNgn(row.paidKobo)}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-rose-700">
                    {formatNgn(row.unpaidBalanceKobo)}
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
