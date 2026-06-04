'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { MonthSummary } from '../hooks/useDashboard';

interface IncomeVsExpensesChartProps {
  summary: MonthSummary | undefined;
}

export function IncomeVsExpensesChart({ summary }: IncomeVsExpensesChartProps) {
  const data = [
    {
      name: 'Este mês',
      Entradas: summary?.totalIncome ?? 0,
      Saídas: summary?.totalExpenses ?? 0,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
        <YAxis
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend />
        <Bar dataKey="Entradas" fill="var(--success)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Saídas" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
