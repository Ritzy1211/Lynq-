import { api } from '../../lib/api';
import { formatDateTime, formatNgn } from '../../lib/format';
import { PrintButton } from './print-button';

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
    <div className="mx-auto max-w-md bg-white p-8 text-slate-900 print:max-w-full print:p-0">
      <div className="text-center">
        <div className="text-xl font-bold">Lynq Laundry</div>
        <div className="text-xs text-slate-500">Customer Receipt</div>
      </div>

      <hr className="my-4 border-slate-300" />

      <div className="text-sm">
        <Row label="Order"><span className="font-mono font-semibold">{order.number}</span></Row>
        <Row label="Date">{formatDateTime(order.createdAt)}</Row>
        <Row label="Status">{order.status}</Row>
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
        <Row label="Subtotal" mono>{formatNgn(order.subtotalKobo)}</Row>
        <Row label={<strong>Total</strong>} mono><strong className="text-lg">{formatNgn(order.totalKobo)}</strong></Row>
        <Row label="Paid" mono>{formatNgn(order.paidKobo)}</Row>
        {owed > 0 && (
          <Row label={<span className="text-rose-700">Balance due</span>} mono>
            <span className="text-rose-700">{formatNgn(owed)}</span>
          </Row>
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

      <div className="mt-6 text-center">
        <PrintButton />
      </div>
    </div>
  );
}

function Row({ label, children, mono }: { label: React.ReactNode; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={mono ? 'font-mono' : ''}>{children}</span>
    </div>
  );
}
