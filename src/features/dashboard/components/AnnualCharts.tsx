'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useAnnualData } from '../hooks/useAnnualData';

interface AnnualChartsProps {
  year: number;
}

export function AnnualCharts({ year }: AnnualChartsProps) {
  const { monthlyData, categoryData, sourceData, totalIncome, totalExpenses,
    bestMonth, worstMonth, avgMonthlyExpense, savingsRate, isLoading } = useAnnualData(year);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full" />)}
      </div>
    );
  }

  const hasData = monthlyData.some((m) => m.income > 0 || m.expenses > 0);
  if (!hasData) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-[var(--text-secondary)]">
        <TrendingUp className="h-10 w-10 opacity-30" />
        <p>Nenhum dado registrado em {year}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Renda Total', value: totalIncome, icon: TrendingUp, color: 'text-[var(--success)]' },
          { label: 'Gastos Totais', value: totalExpenses, icon: TrendingDown, color: 'text-[var(--destructive)]' },
          { label: 'Média Mensal', value: avgMonthlyExpense, icon: Target, color: 'text-[var(--warning)]' },
          { label: 'Taxa de Poupança', value: null, icon: PiggyBank, color: savingsRate >= 20 ? 'text-[var(--success)]' : 'text-[var(--warning)]', text: `${savingsRate.toFixed(1)}%` },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] flex flex-col items-center justify-center gap-1 p-4 min-h-20 text-center">
            <item.icon className={`h-5 w-5 ${item.color} opacity-80`} />
            <p className="text-xs text-[var(--text-secondary)]">{item.label}</p>
            <p className={`text-base font-bold ${item.color}`}>
              {item.text ?? formatCurrency(item.value!)}
            </p>
          </div>
        ))}
      </div>

      {/* Meses destaque */}
      {(bestMonth || worstMonth) && (
        <div className="grid grid-cols-2 gap-3">
          {bestMonth && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
              <p className="text-xs text-[var(--text-secondary)]">Melhor mês</p>
              <p className="font-semibold text-[var(--text-primary)]">{bestMonth.label}</p>
              <p className="text-sm text-[var(--success)]">+{formatCurrency(bestMonth.balance)}</p>
            </div>
          )}
          {worstMonth && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
              <p className="text-xs text-[var(--text-secondary)]">Pior mês</p>
              <p className="font-semibold text-[var(--text-primary)]">{worstMonth.label}</p>
              <p className={`text-sm ${worstMonth.balance < 0 ? 'text-[var(--destructive)]' : 'text-[var(--success)]'}`}>
                {formatCurrency(worstMonth.balance)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Entradas vs Saídas por mês */}
      <Card>
        <CardHeader><CardTitle className="text-base">Entradas vs Saídas — {year}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="income" name="Entradas" fill="var(--success)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" name="Saídas" fill="var(--destructive)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Saldo acumulado */}
      <Card>
        <CardHeader><CardTitle className="text-base">Saldo Acumulado ao Longo do Ano</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Saldo acumulado"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{ fill: 'var(--accent)', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Saldo mensal (sobra/falta) */}
      <Card>
        <CardHeader><CardTitle className="text-base">Resultado por Mês (Sobra / Falta)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Bar
                dataKey="balance"
                name="Resultado"
                radius={[3, 3, 0, 0]}
                fill="var(--success)"
              >
                {monthlyData.map((entry, index) => (
                  <Cell key={index} fill={entry.balance >= 0 ? 'var(--success)' : 'var(--destructive)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gastos por categoria (anual) */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Gastos por Categoria — {year}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                  <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="total" name="Total" radius={[0, 3, 3, 0]}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Fontes de renda (anual) */}
        {sourceData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Fontes de Renda — {year}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={sourceData} dataKey="total" nameKey="source" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, percent }) => `${name ?? ''} (${(((percent as number | undefined) ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'][i % 6]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
