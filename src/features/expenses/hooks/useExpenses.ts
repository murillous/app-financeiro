import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { ExpenseFormData } from '@/lib/validations/expenses';
import type { Transaction } from '@/features/shared/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { lastDayOfMonthString } from '@/lib/utils';

function expenseQueryKey(month: number, year: number) {
  return ['expenses', month, year] as const;
}

export function useExpenses(
  month: number,
  year: number,
  supabaseClient: SupabaseClient = supabase,
) {
  const queryClient = useQueryClient();

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = lastDayOfMonthString(year, month);

  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: expenseQueryKey(month, year),
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabaseClient
        .from('transactions')
        .select('*, categories(name, icon, color), cards(name, color)')
        .gte('date', startDate)
        .lte('date', endDate)
        // Inclui todas as parcelas — cada parcela cai no seu próprio mês
        .order('date', { ascending: false });

      if (error) {
        console.error('[useExpenses] Erro ao buscar gastos:', error);
        throw error;
      }
      return data;
    },
  });

  // amount já é o valor da parcela daquele mês (total / nº parcelas)
  const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);

  const createExpense = useMutation({
    mutationFn: async (formData: ExpenseFormData) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const baseTransaction = {
        ...formData,
        // Campo vazio vira null para não poluir a aba de cobranças
        payer_name: formData.payer_name?.trim() ? formData.payer_name.trim() : null,
        user_id: user.id,
        amount: formData.amount / formData.installments,
        installment_number: formData.installments > 1 ? 1 : null,
        parent_transaction_id: null,
      };

      const { data: firstTx, error: firstError } = await supabaseClient
        .from('transactions')
        .insert(baseTransaction)
        .select()
        .single();

      if (firstError) {
        console.error('[useExpenses] Erro ao criar transação:', firstError);
        throw firstError;
      }

      // Cria as parcelas subsequentes se necessário
      if (formData.installments > 1) {
        const extraInstallments = Array.from({ length: formData.installments - 1 }, (_, i) => {
          const installmentDate = new Date(formData.date);
          installmentDate.setMonth(installmentDate.getMonth() + i + 1);

          return {
            ...baseTransaction,
            date: installmentDate.toISOString().split('T')[0],
            installment_number: i + 2,
            parent_transaction_id: firstTx.id,
          };
        });

        const { error: installError } = await supabaseClient
          .from('transactions')
          .insert(extraInstallments);

        if (installError) {
          console.error('[useExpenses] Erro ao criar parcelas:', installError);
          throw installError;
        }
      }

      return firstTx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Gasto registrado!');
    },
    onError: () => toast.error('Erro ao registrar gasto.'),
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      // Remove também as parcelas relacionadas
      const { error } = await supabaseClient
        .from('transactions')
        .delete()
        .or(`id.eq.${id},parent_transaction_id.eq.${id}`);

      if (error) {
        console.error('[useExpenses] Erro ao remover gasto:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Gasto removido.');
    },
    onError: () => toast.error('Erro ao remover gasto.'),
  });

  return { expenses, totalExpenses, isLoading, error, createExpense, deleteExpense };
}
