import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Lynq — Laundry & Dry-Cleaning',
    template: '%s · Lynq',
  },
  description: 'Laundry & dry-cleaning made effortless — book pickup, track your order, pay seamlessly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
