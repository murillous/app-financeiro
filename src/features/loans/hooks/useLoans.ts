import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Loan } from '../types';

export interface LoanFormData {
  person_name: string;
  description: string;
  amount: number;
  payment_method: Loan['payment_method'];
  date: string;
  due_date?: string | null;
  notes?: string;
}

const QUERY_KEY = ['loans'] as const;

export function useLoans(supabaseClient: SupabaseClient = supabase) {
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Loan[]> => {
      const { data, error } = await supabaseClient
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { console.error('[useLoans] Erro:', error); throw error; }
      return data;
    },
  });

  const pending = loans.filter((l) => l.status === 'pendente');
  const settled = loans.filter((l) => l.status === 'quitado');
  const totalPending = pending.reduce((s, l) => s + l.amount, 0);

  const createLoan = useMutation({
    mutationFn: async (formData: LoanFormData) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabaseClient
        .from('loans')
        .insert({ ...formData, user_id: user.id, status: 'pendente' })
        .select()
        .single();
      if (error) { console.error('[useLoans] Erro ao criar:', error); throw error; }
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Empréstimo registrado!'); },
    onError: () => toast.error('Erro ao registrar empréstimo.'),
  });

  const markAsSettled = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from('loans')
        .update({ status: 'quitado' })
        .eq('id', id);
      if (error) { console.error('[useLoans] Erro ao quitar:', error); throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Empréstimo quitado!'); },
    onError: () => toast.error('Erro ao quitar empréstimo.'),
  });

  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient.from('loans').delete().eq('id', id);
      if (error) { console.error('[useLoans] Erro ao remover:', error); throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: QUERY_KEY }); toast.success('Empréstimo removido.'); },
    onError: () => toast.error('Erro ao remover.'),
  });

  return { loans, pending, settled, totalPending, isLoading, createLoan, markAsSettled, deleteLoan };
}
