import { api } from '../../../../lib/api';
import { formatDateTime, formatNgn } from '../../../../lib/format';

interface OrderDetail {
  id: string;
  number: string;
  status: string;
  totalKobo: number;
  paidKobo: number;
  subtotalKobo: number;
  notes: string | null;
  createdAt: string;
  customer: { fullName: string; phone: string; address: string | null } | null;
  items: Array<{
    id: string;
    quantity: number;
    unitPriceKobo: number;
    subtotalKobo: number;
    garmentTag: string;
    serviceType: { name: string };
    garmentType: { name: string };
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await api.get<OrderDetail>(`/orders/${id}`);
  const owed = Math.max(0, order.totalKobo - order.paidKobo);

  return (
    <html lang="en">
      <body className="bg-white p-8 text-slate-900">
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <div className="text-xl font-bold">Lynq Laundry</div>
            <div className="text-xs text-slate-500">Customer Receipt</div>
          </div>

          <hr className="my-4 border-slate-300" />

          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Order</span>
              <span className="font-mono font-semibold">{order.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span>{order.status}</span>
            </div>
          </div>

          {order.customer && (
            <>
              <hr className="my-4 border-slate-300" />
              <div className="text-sm">
                <div className="font-semibold">{order.customer.fullName}</div>
                <div className="font-mono text-xs text-slate-600">{order.customer.phone}</div>
                {order.customer.address && <div className="text-xs text-slate-600">{order.customer.address}</div>}
              </div>
            </>
          )}

          <hr className="my-4 border-slate-300" />

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-1">Item</th>
                <th className="py-1 text-right">Qty</th>
                <th className="py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-b border-slate-100 align-top">
                  <td className="py-2">
                    <div>{it.serviceType.name} · {it.garmentType.name}</div>
                    <div className="font-mono text-[10px] text-slate-500">{it.garmentTag}</div>
                  </td>
                  <td className="py-2 text-right">{it.quantity}</td>
                  <td className="py-2 text-right font-mono">{formatNgn(it.subtotalKobo)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">{formatNgn(order.subtotalKobo)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="font-mono">{formatNgn(order.totalKobo)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid</span>
              <span className="font-mono">{formatNgn(order.paidKobo)}</span>
            </div>
            {owed > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>Balance due</span>
                <span className="font-mono">{formatNgn(owed)}</span>
              </div>
            )}
          </div>

          {order.notes && (
            <>
              <hr className="my-4 border-slate-300" />
              <div className="text-xs italic text-slate-600">{order.notes}</div>
            </>
          )}

          <hr className="my-4 border-slate-300" />
          <p className="text-center text-xs text-slate-500">Thank you for your business!</p>

          <div className="mt-6 text-center print:hidden">
            <button
              onClick={undefined}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white"
              type="button"
              // server component: we render a plain element; client click handled by inline script
              suppressHydrationWarning
            >
              <span onClick={undefined as never}>Print</span>
            </button>
          </div>
          {/* Plain inline print trigger so we don't need a separate client component */}
          <script dangerouslySetInnerHTML={{ __html: 'document.currentScript.previousElementSibling?.querySelector("button")?.addEventListener("click", () => window.print());' }} />
        </div>
      </body>
    </html>
  );
}
