import type { OrderStatus } from '@lynq/types';

export function formatNgn(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(kobo / 100);
}

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(d);
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  received: 'bg-slate-100 text-slate-700 ring-slate-300',
  washing: 'bg-sky-100 text-sky-800 ring-sky-300',
  ironing: 'bg-amber-100 text-amber-800 ring-amber-300',
  ready: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
  delivered: 'bg-violet-100 text-violet-800 ring-violet-300',
  cancelled: 'bg-rose-100 text-rose-700 ring-rose-300',
};

export function statusBadgeClass(status: OrderStatus): string {
  return STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700 ring-slate-300';
}
