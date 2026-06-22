'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { api, ApiError, swrFetcher } from '../../../lib/api';
import { formatNgn } from '../../../lib/format';

const INPUT =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand';

interface Catalog {
  services: Array<{ id: string; name: string; code: string }>;
  garments: Array<{ id: string; name: string; code: string }>;
  prices: Array<{ serviceTypeId: string; garmentTypeId: string; unitPriceKobo: number }>;
}

interface CustomerRow {
  id: string;
  fullName: string;
  phone: string;
  address: string | null;
}

interface LineRow {
  id: string;
  serviceTypeId: string;
  garmentTypeId: string;
  quantity: number;
  notes?: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const search = useSearchParams();
  const presetCustomerId = search.get('customerId');

  const { data: catalog } = useSWR<Catalog>('/catalog', swrFetcher);

  const [customerQuery, setCustomerQuery] = useState('');
  const [picked, setPicked] = useState<CustomerRow | null>(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ fullName: '', phone: '', address: '' });

  const { data: matches } = useSWR<CustomerRow[]>(
    customerQuery.length >= 2 && !picked ? `/customers?search=${encodeURIComponent(customerQuery)}` : null,
    swrFetcher,
  );

  useEffect(() => {
    if (!presetCustomerId || picked) return;
    api
      .get<CustomerRow>(`/customers/${presetCustomerId}`)
      .then((c) => setPicked(c))
      .catch(() => undefined);
  }, [presetCustomerId, picked]);

  const [lines, setLines] = useState<LineRow[]>([
    { id: crypto.randomUUID(), serviceTypeId: '', garmentTypeId: '', quantity: 1 },
  ]);
  const [notes, setNotes] = useState('');
  const [promised, setPromised] = useState('');

  const priceFor = useMemo(() => {
    const m = new Map<string, number>();
    catalog?.prices.forEach((p) => m.set(`${p.serviceTypeId}::${p.garmentTypeId}`, p.unitPriceKobo));
    return m;
  }, [catalog]);

  const totalKobo = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const unit = priceFor.get(`${l.serviceTypeId}::${l.garmentTypeId}`) ?? 0;
        return sum + unit * l.quantity;
      }, 0),
    [lines, priceFor],
  );

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function addLine() {
    setLines((ls) => [...ls, { id: crypto.randomUUID(), serviceTypeId: '', garmentTypeId: '', quantity: 1 }]);
  }
  function updateLine(id: string, patch: Partial<LineRow>) {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function removeLine(id: string) {
    setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.id !== id)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validLines = lines.filter((l) => l.serviceTypeId && l.garmentTypeId && l.quantity > 0);
    if (validLines.length === 0) {
      setError('Add at least one item.');
      return;
    }
    if (!picked && !showNewCustomer) {
      setError('Pick a customer or register a new one.');
      return;
    }
    if (!picked && (!newCustomer.fullName.trim() || !newCustomer.phone.trim())) {
      setError('New customer needs at least a name and phone.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        items: validLines.map((l) => ({
          serviceTypeId: l.serviceTypeId,
          garmentTypeId: l.garmentTypeId,
          quantity: l.quantity,
          notes: l.notes || undefined,
        })),
        notes: notes || undefined,
        promisedReadyAt: promised ? new Date(promised).toISOString() : undefined,
      };
      if (picked) {
        payload.customerId = picked.id;
      } else {
        payload.customer = {
          fullName: newCustomer.fullName.trim(),
          phone: newCustomer.phone.trim(),
          address: newCustomer.address.trim() || undefined,
        };
      }
      const created = await api.post<{ id: string }>('/orders', payload);
      router.push(`/staff/orders/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create order.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">New order</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Customer</h2>

          {picked ? (
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3">
              <div>
                <div className="font-medium">{picked.fullName}</div>
                <div className="text-xs text-slate-600">
                  <span className="font-mono">{picked.phone}</span>
                  {picked.address && <> · {picked.address}</>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPicked(null);
                  setCustomerQuery('');
                }}
                className="text-xs text-slate-500 hover:text-rose-600"
              >
                Change
              </button>
            </div>
          ) : showNewCustomer ? (
            <div className="space-y-3">
              <input
                placeholder="Full name *"
                value={newCustomer.fullName}
                onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
                className={INPUT}
              />
              <input
                placeholder="Phone *"
                inputMode="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className={INPUT}
              />
              <input
                placeholder="Address (optional)"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                className={INPUT}
              />
              <button
                type="button"
                onClick={() => setShowNewCustomer(false)}
                className="text-xs text-slate-500 hover:text-brand"
              >
                ← Back to search
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                autoFocus
                placeholder="Search name or phone…"
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                className={INPUT}
              />
              {matches && matches.length > 0 && (
                <ul className="max-h-56 overflow-auto rounded-md border border-slate-200">
                  {matches.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setPicked(c)}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <div className="font-medium">{c.fullName}</div>
                        <div className="font-mono text-xs text-slate-500">{c.phone}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowNewCustomer(true);
                  if (customerQuery && !newCustomer.fullName) {
                    setNewCustomer({ ...newCustomer, fullName: customerQuery });
                  }
                }}
                className="text-xs text-brand hover:underline"
              >
                + Register new customer
              </button>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Items</h2>
            <button type="button" onClick={addLine} className="text-xs font-medium text-brand hover:underline">
              + Add item
            </button>
          </div>

          {!catalog ? (
            <div className="text-sm text-slate-500">Loading prices…</div>
          ) : (
            <div className="space-y-3">
              {lines.map((line, idx) => {
                const unit = priceFor.get(`${line.serviceTypeId}::${line.garmentTypeId}`) ?? 0;
                const noPrice = !!line.serviceTypeId && !!line.garmentTypeId && unit === 0;
                return (
                  <div key={line.id} className="grid grid-cols-12 items-end gap-2">
                    <div className="col-span-4">
                      <label className="mb-1 block text-[10px] uppercase text-slate-500">Service</label>
                      <select
                        value={line.serviceTypeId}
                        onChange={(e) => updateLine(line.id, { serviceTypeId: e.target.value })}
                        className={INPUT}
                      >
                        <option value="">Select…</option>
                        {catalog.services.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label className="mb-1 block text-[10px] uppercase text-slate-500">Garment</label>
                      <select
                        value={line.garmentTypeId}
                        onChange={(e) => updateLine(line.id, { garmentTypeId: e.target.value })}
                        className={INPUT}
                      >
                        <option value="">Select…</option>
                        {catalog.garments.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="mb-1 block text-[10px] uppercase text-slate-500">Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                        className={INPUT}
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm">
                      <div className="text-[10px] uppercase text-slate-500">Line total</div>
                      <div className={`font-mono ${noPrice ? 'text-rose-600' : ''}`}>
                        {noPrice ? 'no price' : formatNgn(unit * line.quantity)}
                      </div>
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        disabled={lines.length === 1}
                        className="text-xs text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        aria-label={`Remove item ${idx + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Details</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase text-slate-500">Promised ready</span>
              <input
                type="datetime-local"
                value={promised}
                onChange={(e) => setPromised(e.target.value)}
                className={INPUT}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-[10px] uppercase text-slate-500">Notes for the team</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={INPUT}
                placeholder="Stains, fabric sensitivities, etc."
              />
            </label>
          </div>
        </section>

        <div className="sticky bottom-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase text-slate-500">Total</div>
              <div className="text-2xl font-semibold text-slate-900">{formatNgn(totalKobo)}</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {submitting ? 'Creating…' : 'Create order'}
              </button>
            </div>
          </div>
          {error && <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        </div>
      </form>
    </div>
  );
}
