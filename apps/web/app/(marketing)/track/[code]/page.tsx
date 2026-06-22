interface TrackPageProps {
  params: Promise<{ code: string }>;
}

export default async function TrackOrderPage({ params }: TrackPageProps) {
  const { code } = await params;

  // TODO: fetch order summary from the API. Rendering a placeholder shell so
  // the route is reachable end-to-end during scaffolding.
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Track order {code}</h1>
      <p className="mt-2 text-slate-600">
        We&apos;ll show your order status here, with WhatsApp + SMS notifications mirrored from the API.
      </p>
      <ol className="mt-8 space-y-3 text-sm">
        {['Received', 'Tagged', 'Washing', 'Drying', 'Ironing', 'Ready', 'Delivered'].map((step, i) => (
          <li key={step} className="flex items-center gap-3 rounded-md bg-white p-3 shadow-sm">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-semibold text-white">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
