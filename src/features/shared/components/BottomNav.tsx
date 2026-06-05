'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, TrendingUp, ShoppingCart, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/dashboard/income', label: 'Rendas', icon: TrendingUp },
  { href: '/dashboard/expenses', label: 'Gastos', icon: ShoppingCart },
  { href: '/dashboard/cards', label: 'Cartões', icon: CreditCard },
  { href: '/dashboard/loans', label: 'Empréstimos', icon: Banknote },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--border)] bg-[var(--background)] lg:hidden"
      aria-label="Navegação principal"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
              isActive
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
