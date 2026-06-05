import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface MonthData {
  month: number;
  label: string;
  income: number;
  expenses: number;
  balance: number;
  cumulative: number;
}

export interface AnnualCategoryData {
  name: string;
  color: string;
  total: number;
}

export interface AnnualSourceData {
  source: string;
  total: number;
}

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const SOURCE_LABELS: Record<string, string> = {
  trabalho: 'Trabalho', bolsa: 'Bolsa', freelance: 'Freelance',
  investimento: 'Investimento', aluguel: 'Aluguel', outro: 'Outro',
};

export function useAnnualData(year: number, supabaseClient: SupabaseClient = supabase) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data: monthlyData = [], isLoading: loadingMonthly } = useQuery({
    queryKey: ['annual-monthly', year],
    queryFn: async (): Promise<MonthData[]> => {
      const [incomeRes, expenseRes] = await Promise.all([
        supabaseClient.from('incomes').select('amount, date').gte('date', startDate).lte('date', endDate),
        supabaseClient.from('transactions').select('amount, date')
          .gte('date', startDate).lte('date', endDate),
      ]);

      const incomeByMonth = new Array(12).fill(0);
      const expenseByMonth = new Array(12).fill(0);

      // Extrai mês direto da string "YYYY-MM-DD" (evita off-by-one por UTC)
      const monthFromStr = (dateStr: string) => Number(dateStr.split('-')[1]) - 1;

      for (const r of incomeRes.data ?? []) {
        incomeByMonth[monthFromStr(r.date)] += r.amount;
      }
      for (const r of expenseRes.data ?? []) {
        expenseByMonth[monthFromStr(r.date)] += r.amount;
      }

      let cumulative = 0;
      return MONTH_LABELS.map((label, i) => {
        const income = incomeByMonth[i];
        const expenses = expenseByMonth[i];
        cumulative += income - expenses;
        return { month: i + 1, label, income, expenses, balance: income - expenses, cumulative };
      });
    },
  });

  const { data: categoryData = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['annual-categories', year],
    queryFn: async (): Promise<AnnualCategoryData[]> => {
      const { data } = await supabaseClient
        .from('transactions')
        .select('amount, categories(name, color)')
        .gte('date', startDate).lte('date', endDate);

      const map = new Map<string, AnnualCategoryData>();
      for (const tx of data ?? []) {
        const cat = (tx as unknown as { categories?: { name: string; color: string } }).categories;
        if (!cat) continue;
        const existing = map.get(cat.name);
        const total = tx.amount;
        if (existing) { existing.total += total; }
        else { map.set(cat.name, { name: cat.name, color: cat.color, total }); }
      }
      return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 8);
    },
  });

  const { data: sourceData = [], isLoading: loadingSources } = useQuery({
    queryKey: ['annual-sources', year],
    queryFn: async (): Promise<AnnualSourceData[]> => {
      const { data } = await supabaseClient
        .from('incomes').select('amount, source').gte('date', startDate).lte('date', endDate);

      const map = new Map<string, number>();
      for (const r of data ?? []) {
        map.set(r.source, (map.get(r.source) ?? 0) + r.amount);
      }
      return Array.from(map.entries())
        .map(([source, total]) => ({ source: SOURCE_LABELS[source] ?? source, total }))
        .sort((a, b) => b.total - a.total);
    },
  });

  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const bestMonth = [...monthlyData].sort((a, b) => b.balance - a.balance)[0];
  const worstMonth = [...monthlyData].filter(m => m.income > 0 || m.expenses > 0).sort((a, b) => a.balance - b.balance)[0];
  const avgMonthlyExpense = totalExpenses / 12;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return {
    monthlyData,
    categoryData,
    sourceData,
    totalIncome,
    totalExpenses,
    bestMonth,
    worstMonth,
    avgMonthlyExpense,
    savingsRate,
    isLoading: loadingMonthly || loadingCategories || loadingSources,
  };
}
