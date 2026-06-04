import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { DebtFormData } from '@/lib/validations/debts';
import type { DebtReminder } from '@/features/shared/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

const QUERY_KEY = ['debts'] as const;

export function useDebts(supabaseClient: SupabaseClient = supabase) {
  const queryClient = useQueryClient();

  const { data: debts = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<DebtReminder[]> => {
      const { data, error } = await supabaseClient
        .from('debt_reminders')
        .select('*')
        .eq('is_settled', false)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('[useDebts] Erro ao buscar lembretes:', error);
        throw error;
      }
      return data;
    },
  });

  const iOwe = debts.filter((d) => d.direction === 'eu_devo');
  const theyOwe = debts.filter((d) => d.direction === 'me_devem');
  const totalIOwe = iOwe.reduce((sum, d) => sum + d.amount, 0);
  const totalTheyOwe = theyOwe.reduce((sum, d) => sum + d.amount, 0);

  const createDebt = useMutation({
    mutationFn: async (formData: DebtFormData) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabaseClient
        .from('debt_reminders')
        .insert({ ...formData, user_id: user.id, is_settled: false })
        .select()
        .single();

      if (error) {
        console.error('[useDebts] Erro ao criar lembrete:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Lembrete criado!');
    },
    onError: () => toast.error('Erro ao criar lembrete.'),
  });

  const settleDebt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from('debt_reminders')
        .update({ is_settled: true, settled_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('[useDebts] Erro ao liquidar dívida:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Dívida marcada como liquidada!');
    },
    onError: () => toast.error('Erro ao liquidar dívida.'),
  });

  const deleteDebt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient.from('debt_reminders').delete().eq('id', id);
      if (error) {
        console.error('[useDebts] Erro ao remover lembrete:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Lembrete removido.');
    },
    onError: () => toast.error('Erro ao remover lembrete.'),
  });

  return {
    debts,
    iOwe,
    theyOwe,
    totalIOwe,
    totalTheyOwe,
    isLoading,
    error,
    createDebt,
    settleDebt,
    deleteDebt,
  };
}
