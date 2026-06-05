import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface CardCharge {
  id: string;
  description: string;
  payer_name: string;
  amount: number;
  installments: number;
  installmentNumber: number;
  date: string;
  payment_method: string;
  card_name?: string;
}

const CHARGES_KEY = ['card-charges'] as const;

function mapCharge(tx: Record<string, unknown>): CardCharge {
  return {
    id: tx.id as string,
    description: tx.description as string,
    payer_name: tx.payer_name as string,
    // amount já é o valor da parcela daquele mês
    amount: tx.amount as number,
    installments: tx.installments as number,
    installmentNumber: (tx.installment_number as number) ?? 1,
    date: tx.date as string,
    payment_method: tx.payment_method as string,
    card_name: (tx as { cards?: { name: string } }).cards?.name,
  };
}

export function useLoans(supabaseClient: SupabaseClient = supabase) {
  const queryClient = useQueryClient();

  // Cobranças pendentes (gastos no cartão feitos por outras pessoas)
  const { data: pendingCharges = [], isLoading: loadingPending } = useQuery({
    queryKey: [...CHARGES_KEY, 'pending'],
    queryFn: async (): Promise<CardCharge[]> => {
      const { data, error } = await supabaseClient
        .from('transactions')
        .select('id, description, payer_name, amount, installments, installment_number, date, payment_method, cards(name)')
        .not('payer_name', 'is', null)
        .neq('payer_name', '')
        .eq('payer_settled', false)
        .order('date', { ascending: false });
      if (error) { console.error('[useLoans] pending:', error); throw error; }
      return (data ?? []).map(mapCharge);
    },
  });

  // Cobranças quitadas (já recebidas)
  const { data: settledCharges = [], isLoading: loadingSettled } = useQuery({
    queryKey: [...CHARGES_KEY, 'settled'],
    queryFn: async (): Promise<CardCharge[]> => {
      const { data, error } = await supabaseClient
        .from('transactions')
        .select('id, description, payer_name, amount, installments, installment_number, date, payment_method, cards(name)')
        .not('payer_name', 'is', null)
        .neq('payer_name', '')
        .eq('payer_settled', true)
        .order('date', { ascending: false });
      if (error) { console.error('[useLoans] settled:', error); throw error; }
      return (data ?? []).map(mapCharge);
    },
  });

  const totalPending = pendingCharges.reduce((s, c) => s + c.amount, 0);

  const settleCharge = useMutation({
    mutationFn: async (id: string) => {
      // Quita só a parcela selecionada (cada parcela é cobrada no seu mês)
      const { error } = await supabaseClient
        .from('transactions')
        .update({ payer_settled: true })
        .eq('id', id);
      if (error) { console.error('[useLoans] settle:', error); throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CHARGES_KEY }); toast.success('Marcado como recebido!'); },
    onError: () => toast.error('Erro ao atualizar.'),
  });

  const unsettleCharge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from('transactions')
        .update({ payer_settled: false })
        .eq('id', id);
      if (error) { console.error('[useLoans] unsettle:', error); throw error; }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CHARGES_KEY }); toast.success('Voltou para a cobrar.'); },
    onError: () => toast.error('Erro ao atualizar.'),
  });

  return {
    pendingCharges,
    settledCharges,
    totalPending,
    isLoading: loadingPending || loadingSettled,
    settleCharge,
    unsettleCharge,
  };
}
