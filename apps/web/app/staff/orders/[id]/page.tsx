'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  type OrderStatus,
} from '@lynq/types';
import { api, ApiError, swrFetcher } from '../../../lib/api';
import { formatDateTime, formatNgn, statusBadgeClass } from '../../../lib/format';

interface OrderDetail {
  id: string;
  number: string;
  status: OrderStatus;
  totalKobo: number;
  paidKobo: number;
  subtotalKobo: number;
  notes: string | null;
  promisedReadyAt: string | null;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    phone: string;
    address: string | null;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    unitPriceKobo: number;
    subtotalKobo: number;
    garmentTag: string;
    notes: string | null;
    serviceType: { id: string; name: string };
    garmentType: { id: string; name: string };
  }>;
  statusEvents: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    reason: string | null;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    amountKobo: number;
    method: string;
    providerRef: string | null;
    createdAt: string;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const { data: order, mutate, error, isLoading } = useSWR<OrderDetail>(
    orderId ? `/orders/${orderId}` : null,
    swrFetcher,
  );

  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  async function advance(to: OrderStatus) {
    if (!order) return;
    setBusy(`status:${to}`);
    setFlash(null);
    try {
      await api.post(`/orders/${order.id}/status`, { status: to });
      setFlash({ kind: 'ok', msg: `Marked as ${ORDER_STATUS_LABELS[to]}. Customer notified.` });
      await mutate();
    } catch (err) {
      setFlash({ kind: 'err', msg: err instanceof ApiError ? err.message : 'Could not update status.' });
    } finally {
      setBusy(null);
    }
  }

  async function notify() {
    if (!order) return;
    setBusy('notify');
    setFlash(null);
    try {
      await api.post(`/orders/${order.id}/notifications`);
      setFlash({ kind: 'ok', msg: 'Notification re-sent.' });
    } catch (err) {
      setFlash({ kind: 'err', msg: err instanceof ApiError ? err.message : 'Could not send notification.' });
    } finally {
      setBusy(null);
    }
  }

  if (error) return <div className="p-6 text-rose-700">Could not load order.</div>;
  if (isLoading || !order) return <div className="p-6 text-slate-500">Loading…</div>;

  const owed = Math.max(0, order.totalKobo - order.paidKobo);
  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];

  return (
    <div className="space-y-6">
      <Link href="/staff/orders" className="text-sm text-brand hover:underline">
        ← All orders
      </Link>

      <header className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{order.number}</h1>
              <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${statusBadgeClass(order.status)}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500">Created {formatDateTime(order.createdAt)}</div>
            {order.customer && (
              <div className="mt-3 text-sm">
                <Link href={`/staff/customers/${order.customer.id}`} className="font-medium text-brand-dark hover:underline">
                  {order.customer.fullName}
                </Link>
                <div className="font-mono text-xs text-slate-500">{order.customer.phone}</div>
                {order.customer.address && <div className="text-xs text-slate-500">{order.customer.address}</div>}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs uppercase text-slate-500">Total</div>
            <div className="text-2xl font-semibold">{formatNgn(order.totalKobo)}</div>
            {owed > 0 ? (
              <div className="mt-1 text-xs font-medium text-rose-700">{formatNgn(owed)} unpaid</div>
            ) : (
              <div className="mt-1 text-xs font-medium text-emerald-700">Paid in full</div>
            )}
          </div>
        </div>

        {flash && (
          <div
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              flash.kind === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {flash.msg}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {nextStatuses.length === 0 ? (
            <span className="text-xs text-slate-500">No more status changes — this order is closed.</span>
          ) : (
            nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => advance(s)}
                disabled={busy !== null}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  s === 'cancelled'
                    ? 'border border-rose-300 text-rose-700 hover:bg-rose-50'
                    : 'bg-brand text-white hover:bg-brand-dark'
                } disabled:opacity-60`}
              >
                {busy === `status:${s}` ? '…' : `Mark as ${ORDER_STATUS_LABELS[s]}`}
              </button>
            ))
          )}
          <button
            onClick={notify}
            disabled={busy !== null}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-60"
          >
            {busy === 'notify' ? '…' : 'Re-send notification'}
          </button>
          {owed > 0 && (
            <button
              onClick={() => setPaymentOpen(true)}
              className="rounded-md border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              + Record payment
            </button>
          )}
          <Link
            href={`/receipts/${order.id}`}
            target="_blank"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            Receipt
          </Link>
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Tag</th>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">Garment</th>
              <th className="px-4 py-2 text-right">Qty</th>
              <th className="px-4 py-2 text-right">Unit</th>
              <th className="px-4 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-2 font-mono text-xs">{it.garmentTag}</td>
                <td className="px-4 py-2">{it.serviceType.name}</td>
                <td className="px-4 py-2">{it.garmentType.name}</td>
                <td className="px-4 py-2 text-right">{it.quantity}</td>
                <td className="px-4 py-2 text-right font-mono">{formatNgn(it.unitPriceKobo)}</td>
                <td className="px-4 py-2 text-right font-mono">{formatNgn(it.subtotalKobo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {order.notes && (
          <div className="border-t border-slate-100 px-5 py-3 text-sm">
            <span className="text-xs uppercase text-slate-500">Notes:</span> {order.notes}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Status history</h2>
          </div>
          <ul className="divide-y divide-slate-100 text-sm">
            {order.statusEvents.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between px-5 py-2">
                <span>
                  {ev.fromStatus ? `${ev.fromStatus} → ` : ''}
                  <strong>{ev.toStatus}</strong>
                </span>
                <span className="text-xs text-slate-500">{formatDateTime(ev.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Payments</h2>
          </div>
          {order.payments.length === 0 ? (
            <div className="px-5 py-6 text-sm text-slate-500">No payments yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {order.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-2">
                  <div>
                    <div className="font-medium">{formatNgn(p.amountKobo)}</div>
                    <div className="text-xs text-slate-500">
                      {p.method}
                      {p.providerRef && <> · ref {p.providerRef}</>}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{formatDateTime(p.createdAt)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <NotificationsPanel orderId={order.id} busy={busy === 'notify'} />

      {paymentOpen && (
        <PaymentModal
          owed={owed}
          orderId={order.id}
          onClose={() => setPaymentOpen(false)}
          onDone={() => {
            setPaymentOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
}

function PaymentModal({
  owed,
  orderId,
  onClose,
  onDone,
}: {
  owed: number;
  orderId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [amountNgn, setAmountNgn] = useState((owed / 100).toString());
  const [method, setMethod] = useState<'cash' | 'transfer' | 'pos' | 'card'>('cash');
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const kobo = Math.round(Number(amountNgn) * 100);
      if (!Number.isFinite(kobo) || kobo <= 0) {
        setError('Enter a valid amount.');
        setSubmitting(false);
        return;
      }
      await api.post(`/orders/${orderId}/payments`, {
        amountKobo: kobo,
        method,
        reference: reference || undefined,
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not record payment.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">Record payment</h3>
        <p className="mt-1 text-xs text-slate-500">Outstanding: {formatNgn(owed)}</p>

        <label className="mt-4 block text-xs font-medium uppercase text-slate-600">Amount (₦)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amountNgn}
          onChange={(e) => setAmountNgn(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />

        <label className="mt-3 block text-xs font-medium uppercase text-slate-600">Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as typeof method)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="cash">Cash</option>
          <option value="transfer">Bank transfer</option>
          <option value="pos">POS terminal</option>
          <option value="card">Card</option>
        </select>

        <label className="mt-3 block text-xs font-medium uppercase text-slate-600">Reference (optional)</label>
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          placeholder="Transfer ref, POS slip…"
        />

        {error && <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface NotificationLogRow {
  id: string;
  channel: string;
  template: string;
  recipient: string;
  status: 'queued' | 'sent' | 'failed';
  providerRef: string | null;
  error: string | null;
  payload: { message?: string } | null;
  createdAt: string;
  sentAt: string | null;
}

function NotificationsPanel({ orderId, busy }: { orderId: string; busy: boolean }) {
  const { data, mutate, isLoading } = useSWR<NotificationLogRow[]>(
    `/orders/${orderId}/notifications`,
    swrFetcher,
    { refreshInterval: busy ? 2_000 : 10_000 },
  );
  const [retryingId, setRetryingId] = useState<string | null>(null);

  async function retry(id: string) {
    setRetryingId(id);
    try {
      await api.post(`/notifications/${id}/retry`);
      await mutate();
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Notifications</h2>
        <Link href="/staff/notifications" className="text-xs text-brand hover:underline">
          View all →
        </Link>
      </div>
      {isLoading && <div className="px-5 py-6 text-sm text-slate-500">Loading…</div>}
      {data && data.length === 0 && (
        <div className="px-5 py-6 text-sm text-slate-500">No messages sent yet.</div>
      )}
      {data && data.length > 0 && (
        <ul className="divide-y divide-slate-100 text-sm">
          {data.map((n) => (
            <li key={n.id} className="px-5 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <NotifPill status={n.status} />
                <span className="uppercase tracking-wide text-slate-500">
                  {n.channel} · {n.template}
                </span>
                <span className="font-mono text-slate-500">→ {n.recipient}</span>
                <span className="ml-auto text-slate-400">{formatDateTime(n.createdAt)}</span>
              </div>
              <div className="mt-1 text-slate-800">{n.payload?.message ?? '—'}</div>
              {n.error && (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div className="flex-1 rounded bg-rose-50 px-2 py-1 text-xs text-rose-700">
                    {n.error}
                  </div>
                  <button
                    onClick={() => retry(n.id)}
                    disabled={retryingId === n.id}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-60"
                  >
                    {retryingId === n.id ? '…' : 'Retry'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function NotifPill({ status }: { status: 'queued' | 'sent' | 'failed' }) {
  const cls =
    status === 'sent'
      ? 'bg-emerald-100 text-emerald-800 ring-emerald-300'
      : status === 'queued'
        ? 'bg-amber-100 text-amber-800 ring-amber-300'
        : 'bg-rose-100 text-rose-700 ring-rose-300';
  return <span className={`rounded-full px-2 py-0.5 ring-1 ring-inset ${cls}`}>{status}</span>;
}
