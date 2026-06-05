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

export interface CardCharge {
  id: string;
  description: string;
  payer_name: string;
  amount: number;
  installments: number;
  date: string;
  payment_method: string;
  card_name?: string;
}

const LOANS_KEY = ['loans'] as const;
const CHARGES_KEY = ['card-charges'] as const;

export function useLoans(supabaseClient: SupabaseClient = supabase) {
  const queryClient = useQueryClient();

  // Empréstimos manuais
  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: LOANS_KEY,
    queryFn: async (): Promise<Loan[]> => {
      const { data, error } = await supabaseClient
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { console.error('[useLoans]', error); throw error; }
      return data;
    },
  });

  // Gastos no cartão feitos por outras pessoas (payer_name preenchido)
  const { data: cardCharges = [], isLoading: loadingCharges } = useQuery({
    queryKey: CHARGES_KEY,
    queryFn: async (): Promise<CardCharge[]> => {
      const { data, error } = await supabaseClient
        .from('transactions')
        .select('id, description, payer_name, amount, installments, date, payment_method, cards(name)')
        .not('payer_name', 'is', null)
        .eq('payer_settled', false)
        .is('parent_transaction_id', null)
        .order('date', { ascending: false });
      if (error) { console.error('[useLoans] charges error:', error); throw error; }
      return (data ?? []).map((tx) => ({
        id: tx.id,
        description: tx.description,
        payer_name: tx.payer_name as string,
        amount: tx.amount * tx.installments,
        installments: tx.installments,
        date: tx.date,
        payment_method: tx.payment_method,
        card_name: (tx as unknown as { cards?: { name: string } }).cards?.name,
      }));
    },
  });

  const pending = loans.filter((l) => l.status === 'pendente');
  const settled = loans.filter((l) => l.status === 'quitado');
  const totalPending = pending.reduce((s, l) => s + l.amount, 0);
  const totalCharges = cardCharges.reduce((s, c) => s + c.amount, 0);

  const createLoan = useMutation({
    mutationFn: async (formData: LoanFormData) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabaseClient
        .from('loans')
        .insert({ ...formData, user_id: user.id, status: 'pendente' })
        .select().single();
      if (error) { console.error('[useLoans] create:', error); throw error; }
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: LOANS_KEY }); toast.success('Empréstimo registrado!'); },
    onError: () => toast.error('Erro ao registrar empréstimo.'),
  });

  const markAsSettled = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient.from('loans').update({ status: 'quitado' }).eq('id', id);
      if (error) { console.error('[useLoans] settle:', error); throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: LOANS_KEY }); toast.success('Empréstimo quitado!'); },
    onError: () => toast.error('Erro ao quitar.'),
  });

  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient.from('loans').delete().eq('id', id);
      if (error) { console.error('[useLoans] delete:', error); throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: LOANS_KEY }); toast.success('Removido.'); },
    onError: () => toast.error('Erro ao remover.'),
  });

  // Marca cobrança no cartão como recebida
  const settleCharge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from('transactions')
        .update({ payer_settled: true })
        .or(`id.eq.${id},parent_transaction_id.eq.${id}`);
      if (error) { console.error('[useLoans] settleCharge:', error); throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CHARGES_KEY }); toast.success('Cobrança marcada como recebida!'); },
    onError: () => toast.error('Erro ao atualizar.'),
  });

  return {
    loans, pending, settled, totalPending,
    cardCharges, totalCharges,
    isLoading: loadingLoans || loadingCharges,
    createLoan, markAsSettled, deleteLoan, settleCharge,
  };
}
