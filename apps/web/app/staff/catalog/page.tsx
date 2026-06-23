'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { api, ApiError, swrFetcher } from '../../lib/api';

interface Service {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface Garment {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface Price {
  serviceTypeId: string;
  garmentTypeId: string;
  unitPriceKobo: number;
}

interface Catalog {
  services: Service[];
  garments: Garment[];
  prices: Price[];
}

type Flash = { kind: 'ok' | 'err'; msg: string } | null;

export default function CatalogPage() {
  const { data, error, isLoading, mutate } = useSWR<Catalog>(
    '/catalog?includeInactive=true',
    swrFetcher,
  );
  const [flash, setFlash] = useState<Flash>(null);

  function showError(err: unknown) {
    setFlash({ kind: 'err', msg: err instanceof ApiError ? err.message : 'Save failed.' });
  }
  function showOk(msg: string) {
    setFlash({ kind: 'ok', msg });
  }

  // Auto-dismiss flash after 4s.
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  async function addService(name: string) {
    try {
      await api.post('/catalog/services', { name });
      showOk(`Added service "${name}".`);
      await mutate();
    } catch (err) {
      showError(err);
    }
  }

  async function patchService(id: string, body: { name?: string; isActive?: boolean }) {
    try {
      await api.patch(`/catalog/services/${id}`, body);
      showOk('Saved.');
      await mutate();
    } catch (err) {
      showError(err);
    }
  }

  async function addGarment(name: string) {
    try {
      await api.post('/catalog/garments', { name });
      showOk(`Added garment "${name}".`);
      await mutate();
    } catch (err) {
      showError(err);
    }
  }

  async function patchGarment(id: string, body: { name?: string; isActive?: boolean }) {
    try {
      await api.patch(`/catalog/garments/${id}`, body);
      showOk('Saved.');
      await mutate();
    } catch (err) {
      showError(err);
    }
  }

  async function setPrice(serviceTypeId: string, garmentTypeId: string, nairaValue: string) {
    const trimmed = nairaValue.trim();
    const unitPriceKobo =
      trimmed === ''
        ? null
        : Math.round(Number(trimmed.replace(/,/g, '')) * 100);
    if (unitPriceKobo !== null && (Number.isNaN(unitPriceKobo) || unitPriceKobo < 0)) {
      showError(new ApiError(400, 'Enter a non-negative amount in Naira.'));
      return;
    }
    try {
      await api.put('/catalog/prices', { serviceTypeId, garmentTypeId, unitPriceKobo });
      showOk(unitPriceKobo === null ? 'Price removed.' : 'Price saved.');
      await mutate();
    } catch (err) {
      showError(err);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Service catalog</h1>
          <p className="text-sm text-slate-500">
            Manage services, garments, and the price for each combination. Deactivated items stay
            on past orders but no longer show in the order intake form.
          </p>
        </div>
      </header>

      {flash && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            flash.kind === 'ok'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {flash.msg}
        </div>
      )}

      {isLoading && <div className="text-sm text-slate-500">Loading catalog…</div>}
      {error && (
        <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Could not load the catalog.
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CrudCard
              title="Services"
              items={data.services}
              addPlaceholder="e.g. Express Wash"
              onAdd={addService}
              onPatch={patchService}
            />
            <CrudCard
              title="Garments"
              items={data.garments}
              addPlaceholder="e.g. Kaftan"
              onAdd={addGarment}
              onPatch={patchGarment}
            />
          </div>

          <PriceGrid data={data} onSetPrice={setPrice} />
        </div>
      )}
    </div>
  );
}

function CrudCard({
  title,
  items,
  addPlaceholder,
  onAdd,
  onPatch,
}: {
  title: string;
  items: Array<Service | Garment>;
  addPlaceholder: string;
  onAdd: (name: string) => Promise<void>;
  onPatch: (id: string, body: { name?: string; isActive?: boolean }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd(name.trim());
      setName('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <CrudRow key={item.id} item={item} onPatch={onPatch} />
        ))}
      </ul>
      <form onSubmit={submit} className="flex gap-2 border-t border-slate-100 p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={addPlaceholder}
          className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={!name.trim() || busy}
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </section>
  );
}

function CrudRow({
  item,
  onPatch,
}: {
  item: Service | Garment;
  onPatch: (id: string, body: { name?: string; isActive?: boolean }) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDraft(item.name), [item.name]);

  async function save() {
    if (!draft.trim() || draft === item.name) {
      setEditing(false);
      setDraft(item.name);
      return;
    }
    setBusy(true);
    try {
      await onPatch(item.id, { name: draft.trim() });
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function toggle() {
    setBusy(true);
    try {
      await onPatch(item.id, { isActive: !item.isActive });
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex items-center justify-between px-4 py-2.5 text-sm">
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') {
                setEditing(false);
                setDraft(item.name);
              }
            }}
            autoFocus
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`text-left ${item.isActive ? 'text-slate-900' : 'text-slate-400 line-through'}`}
          >
            {item.name}
          </button>
        )}
        <div className="mt-0.5 font-mono text-[10px] uppercase text-slate-400">{item.code}</div>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`ml-3 rounded-md px-2 py-1 text-xs font-medium ${
          item.isActive
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
        }`}
      >
        {item.isActive ? 'Deactivate' : 'Activate'}
      </button>
    </li>
  );
}

function PriceGrid({
  data,
  onSetPrice,
}: {
  data: Catalog;
  onSetPrice: (serviceTypeId: string, garmentTypeId: string, nairaValue: string) => Promise<void>;
}) {
  const activeServices = data.services.filter((s) => s.isActive);
  const activeGarments = data.garments.filter((g) => g.isActive);

  // Index for O(1) lookup.
  const priceMap = new Map<string, number>();
  for (const p of data.prices) {
    priceMap.set(`${p.serviceTypeId}::${p.garmentTypeId}`, p.unitPriceKobo);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Prices (₦ per item)
        </h2>
        <span className="text-xs text-slate-500">
          Click a cell, type the new price, then press Enter or Tab. Leave blank to remove.
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">Garment ↓ / Service →</th>
              {activeServices.map((s) => (
                <th key={s.id} className="px-3 py-2">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeGarments.map((g) => (
              <tr key={g.id}>
                <td className="px-3 py-2 font-medium text-slate-700">{g.name}</td>
                {activeServices.map((s) => {
                  const kobo = priceMap.get(`${s.id}::${g.id}`);
                  return (
                    <td key={s.id} className="px-2 py-1">
                      <PriceCell
                        kobo={kobo}
                        onSubmit={(v) => onSetPrice(s.id, g.id, v)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PriceCell({
  kobo,
  onSubmit,
}: {
  kobo: number | undefined;
  onSubmit: (nairaValue: string) => Promise<void>;
}) {
  const initial = kobo === undefined ? '' : (kobo / 100).toString();
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);

  useEffect(() => setValue(initial), [initial]);

  async function commit() {
    if (value === initial) return;
    setBusy(true);
    try {
      await onSubmit(value);
    } finally {
      setBusy(false);
    }
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          (e.target as HTMLInputElement).blur();
        }
        if (e.key === 'Escape') {
          setValue(initial);
        }
      }}
      disabled={busy}
      inputMode="decimal"
      placeholder="—"
      className={`w-28 rounded-md border px-2 py-1 text-right font-mono text-sm tabular-nums ${
        value === ''
          ? 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
          : 'border-slate-200 bg-white text-slate-900'
      } focus:border-brand focus:outline-none`}
    />
  );
}
