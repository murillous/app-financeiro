'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryCards, ExpenseChart, IncomeVsExpensesChart, useDashboard } from '@/features/dashboard';
import { AnnualCharts } from '@/features/dashboard/components/AnnualCharts';
import { FixedExpensesWidget } from '@/features/fixed-expenses';
import { useSnapshot } from '@/features/snapshot';
import { formatMonth } from '@/lib/utils';
import { ThemeToggle } from '@/features/shared';
import { useAuth } from '@/features/auth';

export default function DashboardPage() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [view, setView] = useState<'mensal' | 'anual'>('mensal');

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { summary, categoryExpenses, isLoading } = useDashboard(month, year);
  const { totalBalance, totalPendingDebt, netWorth, isLoading: loadingSnapshot } = useSnapshot();
  const { signOut } = useAuth();

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  const prevYear = () => setCurrentDate(new Date(year - 1, currentDate.getMonth(), 1));
  const nextYear = () => setCurrentDate(new Date(year + 1, currentDate.getMonth(), 1));
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
  const isCurrentYear = year === now.getFullYear();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Visão Geral</h1>
          <p className="text-sm text-[var(--text-secondary)] capitalize">
            {view === 'mensal' ? formatMonth(currentDate) : String(year)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {view === 'mensal' ? (
            <>
              <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Mês anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} disabled={isCurrentMonth} aria-label="Próximo mês">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={prevYear} aria-label="Ano anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextYear} disabled={isCurrentYear} aria-label="Próximo ano">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="hidden lg:flex text-[var(--text-secondary)]">
            Sair
          </Button>
        </div>
      </div>

      {/* Abas Mensal / Anual */}
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <TabsList>
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
          <TabsTrigger value="anual">Anual</TabsTrigger>
        </TabsList>

        <TabsContent value="mensal" className="space-y-6 mt-4">
          <SummaryCards summary={summary} totalBalance={totalBalance} totalPendingDebt={totalPendingDebt} netWorth={netWorth} isLoading={isLoading || loadingSnapshot} />
          <Separator />
          <Card>
            <CardContent className="pt-6">
              <FixedExpensesWidget />
            </CardContent>
          </Card>
          <Separator />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Entradas vs Saídas</CardTitle></CardHeader>
              <CardContent><IncomeVsExpensesChart summary={summary} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Gastos por Categoria</CardTitle></CardHeader>
              <CardContent><ExpenseChart data={categoryExpenses} /></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anual" className="mt-4">
          <AnnualCharts year={year} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
