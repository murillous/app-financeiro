'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, TrendingUp, ShoppingCart, Banknote, LogOut, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/income', label: 'Rendas', icon: TrendingUp },
  { href: '/dashboard/expenses', label: 'Gastos', icon: ShoppingCart },
  { href: '/dashboard/cards', label: 'Cartões', icon: CreditCard },
  { href: '/dashboard/loans', label: 'Empréstimos', icon: Banknote },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--background)]">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-[var(--border)]">
        <Wallet className="h-6 w-6 text-[var(--accent)]" />
        <span className="text-lg font-bold text-[var(--text-primary)]">Finanças</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Navegação lateral">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors mb-1',
                isActive
                  ? 'bg-[var(--surface)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={signOut}
              className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--destructive)] transition-colors"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
