const KPIS = [
  { label: 'Revenue (today)', value: '₦ 0', sub: '+0% vs yesterday' },
  { label: 'Orders (today)', value: '0', sub: '0 ready · 0 in progress' },
  { label: 'Avg. ticket', value: '₦ 0', sub: '7-day average' },
  { label: 'Turnaround time', value: '— h', sub: 'received → ready' },
];

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="mt-2 text-slate-600">
        KPIs are placeholders until the API is producing data. Backed by SQL views in Postgres for performance.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <article key={kpi.label} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">{kpi.label}</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight">{kpi.value}</div>
            <div className="mt-1 text-xs text-slate-500">{kpi.sub}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
