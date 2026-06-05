import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { IncomeFormData } from '@/lib/validations/income';
import type { Income } from '@/features/shared/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { lastDayOfMonthString } from '@/lib/utils';

function incomeQueryKey(month: number, year: number) {
  return ['incomes', month, year] as const;
}

export function useIncome(
  month: number,
  year: number,
  supabaseClient: SupabaseClient = supabase,
) {
  const queryClient = useQueryClient();

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = lastDayOfMonthString(year, month);

  const { data: incomes = [], isLoading, error } = useQuery({
    queryKey: incomeQueryKey(month, year),
    queryFn: async (): Promise<Income[]> => {
      const { data, error } = await supabaseClient
        .from('incomes')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('[useIncome] Erro ao buscar rendas:', error);
        throw error;
      }
      return data;
    },
  });

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  const createIncome = useMutation({
    mutationFn: async (formData: IncomeFormData) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabaseClient
        .from('incomes')
        .insert({ ...formData, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('[useIncome] Erro ao registrar renda:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast.success('Renda registrada!');
    },
    onError: () => toast.error('Erro ao registrar renda.'),
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient.from('incomes').delete().eq('id', id);
      if (error) {
        console.error('[useIncome] Erro ao remover renda:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast.success('Renda removida.');
    },
    onError: () => toast.error('Erro ao remover renda.'),
  });

  return { incomes, totalIncome, isLoading, error, createIncome, deleteIncome };
}
