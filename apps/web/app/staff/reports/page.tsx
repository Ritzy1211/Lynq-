'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { swrFetcher } from '../../lib/api';
import { formatDateTime, formatNgn } from '../../lib/format';

interface UnpaidRow {
  id: string;
  number: string;
  customerName: string | null;
  customerPhone: string | null;
  totalKobo: number;
  paidKobo: number;
  outstandingKobo: number;
}

interface CompletedRow {
  id: string;
  number: string;
  customerName: string | null;
  totalKobo: number;
  completedAt: string;
}

interface EodReport {
  date: string;
  windowStart: string;
  windowEnd: string;
  orders: {
    created: number;
    createdValueKobo: number;
    createdPaidKobo: number;
    createdOutstandingKobo: number;
    byStatus: Record<string, number>;
    unpaid: UnpaidRow[];
  };
  completed: {
    count: number;
    totalValueKobo: number;
    orders: CompletedRow[];
  };
  revenue: {
    collectedKobo: number;
    paymentCount: number;
    byMethod: Record<string, { count: number; amountKobo: number }>;
  };
  notifications: {
    sent: number;
    failed: number;
  };
}

const METHOD_LABEL: Record<string, string> = {
  cash: 'Cash',
  transfer: 'Bank transfer',
  card: 'Card',
  pos: 'POS terminal',
};

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ReportsPage() {
  const [date, setDate] = useState<string>(todayIso());
  const { data, error, isLoading } = useSWR<EodReport>(
    `/reports/eod?date=${date}`,
    swrFetcher,
  );

  // Friendly display for the date header (avoids hydration mismatch by waiting
  // until mount before reading the user's locale).
  const [pretty, setPretty] = useState<string>(date);
  useEffect(() => {
    setPretty(
      new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
  }, [date]);

  const sortedStatusRows = useMemo(() => {
    if (!data) return [];
    const order = ['received', 'washing', 'ironing', 'ready', 'delivered', 'cancelled'];
    return order
      .filter((s) => data.orders.byStatus[s] !== undefined)
      .map((s) => ({ status: s, count: data.orders.byStatus[s] ?? 0 }));
  }, [data]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">End-of-day report</h1>
          <p className="text-sm text-slate-500">
            Run this at close of business to reconcile cash, orders, and customer messages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">
            Date
            <input
              type="date"
              value={date}
              max={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              className="ml-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-brand-dark"
          >
            Print
          </button>
        </div>
      </header>

      {/* Printable summary card */}
      <article className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 print:border-0 print:p-0 print:shadow-none">
        <div className="border-b border-slate-100 pb-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Lynq · End-of-day</div>
          <h2 className="mt-1 text-xl font-semibold">{pretty}</h2>
        </div>

        {isLoading && <div className="text-sm text-slate-500">Loading report…</div>}
        {error && (
          <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Could not load the report. Try again in a moment.
          </div>
        )}

        {data && (
          <>
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Orders booked" value={data.orders.created.toString()} />
              <Stat label="Orders delivered" value={data.completed.count.toString()} />
              <Stat label="Cash collected" value={formatNgn(data.revenue.collectedKobo)} highlight />
              <Stat
                label="Outstanding (today)"
                value={formatNgn(data.orders.createdOutstandingKobo)}
              />
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card title="Revenue collected">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="py-1 text-left font-medium">Method</th>
                      <th className="py-1 text-right font-medium">Count</th>
                      <th className="py-1 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(data.revenue.byMethod).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-3 text-center text-slate-500">
                          No payments collected on this day.
                        </td>
                      </tr>
                    ) : (
                      Object.entries(data.revenue.byMethod).map(([m, v]) => (
                        <tr key={m}>
                          <td className="py-1.5">{METHOD_LABEL[m] ?? m}</td>
                          <td className="py-1.5 text-right tabular-nums">{v.count}</td>
                          <td className="py-1.5 text-right font-mono tabular-nums">
                            {formatNgn(v.amountKobo)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 font-medium">
                      <td className="py-1.5">Total</td>
                      <td className="py-1.5 text-right tabular-nums">
                        {data.revenue.paymentCount}
                      </td>
                      <td className="py-1.5 text-right font-mono tabular-nums">
                        {formatNgn(data.revenue.collectedKobo)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </Card>

              <Card title="Orders by status (booked today)">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {sortedStatusRows.map(({ status, count }) => (
                      <tr key={status}>
                        <td className="py-1.5 capitalize">{status}</td>
                        <td className="py-1.5 text-right tabular-nums">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 font-medium">
                      <td className="py-1.5">Total booked</td>
                      <td className="py-1.5 text-right tabular-nums">{data.orders.created}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-slate-500">Booked value</td>
                      <td className="py-1.5 text-right font-mono tabular-nums text-slate-700">
                        {formatNgn(data.orders.createdValueKobo)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </Card>
            </section>

            <Card title={`Orders delivered (${data.completed.count})`}>
              {data.completed.orders.length === 0 ? (
                <p className="text-sm text-slate-500">No orders were delivered on this day.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="py-1 text-left font-medium">Order</th>
                      <th className="py-1 text-left font-medium">Customer</th>
                      <th className="py-1 text-left font-medium">Delivered</th>
                      <th className="py-1 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.completed.orders.map((o) => (
                      <tr key={o.id}>
                        <td className="py-1.5 font-medium">{o.number}</td>
                        <td className="py-1.5">{o.customerName ?? 'Walk-in'}</td>
                        <td className="py-1.5 text-slate-600">{formatDateTime(o.completedAt)}</td>
                        <td className="py-1.5 text-right font-mono tabular-nums">
                          {formatNgn(o.totalKobo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 font-medium">
                      <td colSpan={3} className="py-1.5">
                        Total delivered value
                      </td>
                      <td className="py-1.5 text-right font-mono tabular-nums">
                        {formatNgn(data.completed.totalValueKobo)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </Card>

            <Card title={`Unpaid from today (${data.orders.unpaid.length})`}>
              {data.orders.unpaid.length === 0 ? (
                <p className="text-sm text-slate-500">Everything booked today is paid in full.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="py-1 text-left font-medium">Order</th>
                      <th className="py-1 text-left font-medium">Customer</th>
                      <th className="py-1 text-right font-medium">Total</th>
                      <th className="py-1 text-right font-medium">Paid</th>
                      <th className="py-1 text-right font-medium">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.orders.unpaid.map((o) => (
                      <tr key={o.id}>
                        <td className="py-1.5 font-medium">{o.number}</td>
                        <td className="py-1.5">
                          {o.customerName ?? 'Walk-in'}
                          {o.customerPhone && (
                            <span className="ml-2 text-xs text-slate-500">{o.customerPhone}</span>
                          )}
                        </td>
                        <td className="py-1.5 text-right font-mono tabular-nums">
                          {formatNgn(o.totalKobo)}
                        </td>
                        <td className="py-1.5 text-right font-mono tabular-nums text-slate-600">
                          {formatNgn(o.paidKobo)}
                        </td>
                        <td className="py-1.5 text-right font-mono tabular-nums text-rose-700">
                          {formatNgn(o.outstandingKobo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 font-medium">
                      <td colSpan={4} className="py-1.5">
                        Total outstanding from today
                      </td>
                      <td className="py-1.5 text-right font-mono tabular-nums text-rose-700">
                        {formatNgn(data.orders.createdOutstandingKobo)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </Card>

            <Card title="Customer messages">
              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Sent</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {data.notifications.sent}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Failed</div>
                  <div
                    className={`mt-1 text-lg font-semibold ${
                      data.notifications.failed > 0 ? 'text-rose-700' : 'text-slate-900'
                    }`}
                  >
                    {data.notifications.failed}
                  </div>
                </div>
              </div>
            </Card>

            <footer className="border-t border-slate-100 pt-3 text-xs text-slate-500">
              Window: {formatDateTime(data.windowStart)} → {formatDateTime(data.windowEnd)}
            </footer>
          </>
        )}
      </article>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-md border p-3 ${
        highlight ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div
        className={`mt-1 text-xl font-semibold ${
          highlight ? 'text-emerald-800' : 'text-slate-900'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
  );
}
