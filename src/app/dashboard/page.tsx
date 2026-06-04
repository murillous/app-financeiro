'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SummaryCards, ExpenseChart, IncomeVsExpensesChart, useDashboard } from '@/features/dashboard';
import { formatMonth } from '@/lib/utils';
import { ThemeToggle } from '@/features/shared';
import { useAuth } from '@/features/auth';

export default function DashboardPage() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { summary, categoryExpenses, accumulatedBalance, isLoading } = useDashboard(month, year);
  const { signOut, user } = useAuth();

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Visão Geral</h1>
          <p className="text-sm text-[var(--text-secondary)] capitalize">
            {formatMonth(currentDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Mês anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} disabled={isCurrentMonth} aria-label="Próximo mês">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="hidden lg:flex text-[var(--text-secondary)]"
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <SummaryCards summary={summary} accumulatedBalance={accumulatedBalance} isLoading={isLoading} />

      <Separator />

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entradas vs Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeVsExpensesChart summary={summary} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseChart data={categoryExpenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
