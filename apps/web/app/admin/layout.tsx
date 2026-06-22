import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight text-brand">Lynq · Admin</div>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/analytics" className="hover:text-brand">
              Analytics
            </Link>
            <Link href="/admin/branches" className="hover:text-brand">
              Branches
            </Link>
            <Link href="/admin/users" className="hover:text-brand">
              Users
            </Link>
          </nav>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
