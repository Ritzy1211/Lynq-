'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { api, ApiError, swrFetcher } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

type NotificationStatus = 'queued' | 'sent' | 'failed';

interface NotificationRow {
  id: string;
  channel: string;
  template: string;
  recipient: string;
  status: NotificationStatus;
  providerRef: string | null;
  error: string | null;
  payload: { message?: string; status?: string } | null;
  createdAt: string;
  sentAt: string | null;
  order: { id: string; number: string; status: string } | null;
}

interface ListResponse {
  items: NotificationRow[];
  nextCursor: string | null;
}

const STATUS_TABS: Array<{ value: NotificationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'queued', label: 'Queued' },
  { value: 'failed', label: 'Failed' },
];

export default function NotificationsPage() {
  const [status, setStatus] = useState<NotificationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (status !== 'all') p.set('status', status);
    if (search.trim()) p.set('search', search.trim());
    p.set('limit', '100');
    return p.toString();
  }, [status, search]);

  const { data, isLoading, error, mutate } = useSWR<ListResponse>(
    `/notifications?${qs}`,
    swrFetcher,
    { refreshInterval: 15_000 },
  );

  async function retry(id: string) {
    setBusy(id);
    setFlash(null);
    try {
      await api.post(`/notifications/${id}/retry`);
      setFlash({ kind: 'ok', msg: 'Retry queued.' });
      await mutate();
    } catch (err) {
      setFlash({ kind: 'err', msg: err instanceof ApiError ? err.message : 'Retry failed.' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-slate-500">
            Every message the system sent (or tried to send) to customers.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search phone or LYNQ-…"
          className="w-64 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </header>

      <div className="flex flex-wrap gap-1 text-sm">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`rounded-md px-3 py-1.5 ${
              status === t.value
                ? 'bg-brand text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {flash && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            flash.kind === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {flash.msg}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {isLoading && <div className="p-6 text-sm text-slate-500">Loading…</div>}
        {error && <div className="p-6 text-sm text-rose-700">Could not load notifications.</div>}
        {data && data.items.length === 0 && (
          <div className="p-6 text-sm text-slate-500">No notifications match.</div>
        )}
        {data && data.items.length > 0 && (
          <ul className="divide-y divide-slate-100 text-sm">
            {data.items.map((n) => (
              <li key={n.id} className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[1fr_auto] md:items-start">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={n.status} />
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      {n.channel} · {n.template}
                    </span>
                    {n.order && (
                      <Link
                        href={`/staff/orders/${n.order.id}`}
                        className="text-xs font-mono text-brand hover:underline"
                      >
                        {n.order.number}
                      </Link>
                    )}
                    <span className="font-mono text-xs text-slate-500">→ {n.recipient}</span>
                  </div>
                  <div className="text-slate-800">{n.payload?.message ?? '—'}</div>
                  {n.error && (
                    <div className="rounded bg-rose-50 px-2 py-1 text-xs text-rose-700">{n.error}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 text-xs text-slate-500">
                  <div>{formatDateTime(n.createdAt)}</div>
                  {n.providerRef && <div className="font-mono">ref {n.providerRef}</div>}
                  {n.status !== 'sent' && (
                    <button
                      onClick={() => retry(n.id)}
                      disabled={busy === n.id}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-60"
                    >
                      {busy === n.id ? '…' : 'Retry'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: NotificationStatus }) {
  const cls =
    status === 'sent'
      ? 'bg-emerald-100 text-emerald-800 ring-emerald-300'
      : status === 'queued'
        ? 'bg-amber-100 text-amber-800 ring-amber-300'
        : 'bg-rose-100 text-rose-700 ring-rose-300';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${cls}`}>{status}</span>
  );
}
