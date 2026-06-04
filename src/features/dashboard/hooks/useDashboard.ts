import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface MonthSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface CategoryExpense {
  name: string;
  color: string;
  total: number;
}

export function useDashboard(
  month: number,
  year: number,
  supabaseClient: SupabaseClient = supabase,
) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboard-summary', month, year],
    queryFn: async (): Promise<MonthSummary> => {
      const [incomeRes, expenseRes] = await Promise.all([
        supabaseClient
          .from('incomes')
          .select('amount')
          .gte('date', startDate)
          .lte('date', endDate),
        supabaseClient
          .from('transactions')
          .select('amount, installments')
          .gte('date', startDate)
          .lte('date', endDate)
          .is('parent_transaction_id', null),
      ]);

      const totalIncome = (incomeRes.data ?? []).reduce((sum, r) => sum + r.amount, 0);
      const totalExpenses = (expenseRes.data ?? []).reduce(
        (sum, r) => sum + r.amount * r.installments,
        0,
      );

      return { month, year, totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
    },
  });

  const { data: categoryExpenses = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['dashboard-categories', month, year],
    queryFn: async (): Promise<CategoryExpense[]> => {
      const { data, error } = await supabaseClient
        .from('transactions')
        .select('amount, installments, categories(name, color)')
        .gte('date', startDate)
        .lte('date', endDate)
        .is('parent_transaction_id', null);

      if (error) throw error;

      // Agrupa por categoria
      const grouped = new Map<string, CategoryExpense>();
      for (const tx of data ?? []) {
        const cat = (tx as unknown as { categories: { name: string; color: string } }).categories;
        if (!cat) continue;
        const key = cat.name;
        const existing = grouped.get(key);
        const total = (tx.amount as number) * (tx.installments as number);
        if (existing) {
          existing.total += total;
        } else {
          grouped.set(key, { name: cat.name, color: cat.color, total });
        }
      }

      return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
    },
  });

  // Saldo acumulado: soma todos os meses anteriores
  const { data: accumulatedBalance = 0, isLoading: loadingAccumulated } = useQuery({
    queryKey: ['dashboard-accumulated', month, year],
    queryFn: async (): Promise<number> => {
      const [allIncome, allExpenses] = await Promise.all([
        supabaseClient.from('incomes').select('amount').lte('date', endDate),
        supabaseClient
          .from('transactions')
          .select('amount, installments')
          .lte('date', endDate)
          .is('parent_transaction_id', null),
      ]);

      const income = (allIncome.data ?? []).reduce((s, r) => s + r.amount, 0);
      const expenses = (allExpenses.data ?? []).reduce(
        (s, r) => s + r.amount * r.installments,
        0,
      );
      return income - expenses;
    },
  });

  return {
    summary,
    categoryExpenses,
    accumulatedBalance,
    isLoading: loadingSummary || loadingCategories || loadingAccumulated,
  };
}
