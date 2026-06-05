'use client';

import { TrendingUp, TrendingDown, Wallet, Landmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { MonthSummary } from '../hooks/useDashboard';

interface SummaryCardsProps {
  summary: MonthSummary | undefined;
  totalBalance: number;
  totalPendingDebt: number;
  netWorth: number;
  isLoading: boolean;
}

export function SummaryCards({ summary, totalBalance, totalPendingDebt, netWorth, isLoading }: SummaryCardsProps) {
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
      label: 'Saldo Líquido',
      value: netWorth,
      icon: Landmark,
      color: netWorth >= 0 ? 'text-[var(--accent)]' : 'text-[var(--destructive)]',
    },
  ];

  return (
    <div className="space-y-3">
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

      {/* Breakdown do Raio-X (origem do Saldo Líquido) */}
      {(totalBalance > 0 || totalPendingDebt > 0) && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
          <span>Em conta: <span className="text-[var(--success)] font-medium">{formatCurrency(totalBalance)}</span></span>
          <span>Parcelas a pagar: <span className="text-[var(--destructive)] font-medium">{formatCurrency(totalPendingDebt)}</span></span>
        </div>
      )}
    </div>
  );
}
