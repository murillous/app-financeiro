import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { todayLocalString } from '@/lib/utils';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FixedExpense } from '../types';

export interface FixedExpenseFormData {
  name: string;
  amount: number;
  due_day: number;
  category_id?: string | null;
  notes?: string;
}

const QUERY_KEY = ['fixed-expenses'] as const;

// Mês atual como "YYYY-MM" (horário local)
function currentMonthString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function useFixedExpenses(supabaseClient: SupabaseClient = supabase) {
  const queryClient = useQueryClient();
  const currentMonth = currentMonthString();

  const { data: fixedExpenses = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<FixedExpense[]> => {
      const { data, error } = await supabaseClient
        .from('fixed_expenses')
        .select('*')
        .eq('is_active', true)
        .order('due_day', { ascending: true });
      if (error) { console.error('[useFixedExpenses]', error); throw error; }
      return data;
    },
  });

  const totalFixed = fixedExpenses.reduce((s, e) => s + e.amount, 0);

  const createFixedExpense = useMutation({
    mutationFn: async (formData: FixedExpenseFormData) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabaseClient
        .from('fixed_expenses')
        .insert({ ...formData, user_id: user.id })
        .select().single();
      if (error) { console.error('[useFixedExpenses] create:', error); throw error; }
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Gasto fixo adicionado!'); },
    onError: () => toast.error('Erro ao adicionar gasto fixo.'),
  });

  const updateFixedExpense = useMutation({
    mutationFn: async ({ id, ...data }: FixedExpenseFormData & { id: string }) => {
      const { error } = await supabaseClient.from('fixed_expenses').update(data).eq('id', id);
      if (error) { console.error('[useFixedExpenses] update:', error); throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Atualizado!'); },
    onError: () => toast.error('Erro ao atualizar.'),
  });

  const deleteFixedExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient.from('fixed_expenses').update({ is_active: false }).eq('id', id);
      if (error) { console.error('[useFixedExpenses] delete:', error); throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Gasto fixo removido.'); },
    onError: () => toast.error('Erro ao remover.'),
  });

  // Lança o gasto fixo como transação no mês atual
  const launchAsExpense = useMutation({
    mutationFn: async (fixedExpense: FixedExpense) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const today = todayLocalString();
      const now = new Date();
      const dueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(fixedExpense.due_day).padStart(2, '0')}`;

      const { error } = await supabaseClient.from('transactions').insert({
        user_id: user.id,
        description: fixedExpense.name,
        amount: fixedExpense.amount,
        category_id: fixedExpense.category_id,
        payment_method: 'pix',
        date: dueDate <= today ? dueDate : today,
        installments: 1,
        installment_number: null,
        parent_transaction_id: null,
        notes: fixedExpense.notes ?? `Gasto fixo — lançado em ${today}`,
        is_recurring: true,
      });
      if (error) { console.error('[useFixedExpenses] launch:', error); throw error; }

      // Marca a conta como paga no mês atual — some da lista até o próximo mês
      const { error: updateError } = await supabaseClient
        .from('fixed_expenses')
        .update({ last_paid_month: currentMonth })
        .eq('id', fixedExpense.id);
      if (updateError) { console.error('[useFixedExpenses] mark paid:', updateError); throw updateError; }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Pago! Reaparece no próximo mês.');
    },
    onError: () => toast.error('Erro ao lançar gasto.'),
  });

  // Desfaz o pagamento do mês (volta a aparecer na lista)
  const undoPayment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from('fixed_expenses')
        .update({ last_paid_month: null })
        .eq('id', id);
      if (error) { console.error('[useFixedExpenses] undo:', error); throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Voltou para pendente.'); },
    onError: () => toast.error('Erro ao desfazer.'),
  });

  // Pendentes este mês (não pagas) vs já pagas neste mês
  const pendingThisMonth = fixedExpenses.filter((e) => e.last_paid_month !== currentMonth);
  const paidThisMonth = fixedExpenses.filter((e) => e.last_paid_month === currentMonth);

  return {
    fixedExpenses,
    pendingThisMonth,
    paidThisMonth,
    totalFixed,
    isLoading,
    createFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    launchAsExpense,
    undoPayment,
  };
}
