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
    amount: (tx.amount as number) * (tx.installments as number),
    installments: tx.installments as number,
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
        .select('id, description, payer_name, amount, installments, date, payment_method, cards(name)')
        .not('payer_name', 'is', null)
        .eq('payer_settled', false)
        .is('parent_transaction_id', null)
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
        .select('id, description, payer_name, amount, installments, date, payment_method, cards(name)')
        .not('payer_name', 'is', null)
        .eq('payer_settled', true)
        .is('parent_transaction_id', null)
        .order('date', { ascending: false });
      if (error) { console.error('[useLoans] settled:', error); throw error; }
      return (data ?? []).map(mapCharge);
    },
  });

  const totalPending = pendingCharges.reduce((s, c) => s + c.amount, 0);

  const settleCharge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient
        .from('transactions')
        .update({ payer_settled: true })
        .or(`id.eq.${id},parent_transaction_id.eq.${id}`);
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
        .or(`id.eq.${id},parent_transaction_id.eq.${id}`);
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
