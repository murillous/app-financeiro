'use client';

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { MonthSummary } from '../hooks/useDashboard';

interface SummaryCardsProps {
  summary: MonthSummary | undefined;
  accumulatedBalance: number;
  isLoading: boolean;
}

export function SummaryCards({ summary, accumulatedBalance, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  const items = [
    {
      label: 'Entradas',
      value: summary?.totalIncome ?? 0,
      icon: TrendingUp,
      color: 'text-[var(--success)]',
    },
    {
      label: 'Saídas',
      value: summary?.totalExpenses ?? 0,
      icon: TrendingDown,
      color: 'text-[var(--destructive)]',
    },
    {
      label: 'Saldo do Mês',
      value: summary?.balance ?? 0,
      icon: Wallet,
      color: (summary?.balance ?? 0) >= 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]',
    },
    {
      label: 'Saldo Acumulado',
      value: accumulatedBalance,
      icon: PiggyBank,
      color: accumulatedBalance >= 0 ? 'text-[var(--accent)]' : 'text-[var(--destructive)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col items-center justify-center gap-2 p-4 min-h-24 text-center"
        >
          <item.icon className={`h-6 w-6 ${item.color} opacity-80`} />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">{item.label}</p>
            <p className={`text-lg font-bold ${item.color} mt-0.5`}>
              {formatCurrency(item.value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
