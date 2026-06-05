import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AccountBalance, PendingInstallment } from '../types';

export interface BalanceFormData {
  bank_name: string;
  balance: number;
}

export interface InstallmentFormData {
  description: string;
  bank_name: string;
  installment_amount: number;
  total_installments: number;
  paid_installments: number;
  due_day?: number | null;
}

const BALANCES_KEY = ['account-balances'] as const;
const INSTALLMENTS_KEY = ['pending-installments'] as const;

export function useSnapshot(supabaseClient: SupabaseClient = supabase) {
  const queryClient = useQueryClient();

  const { data: balances = [], isLoading: loadingBalances } = useQuery({
    queryKey: BALANCES_KEY,
    queryFn: async (): Promise<AccountBalance[]> => {
      const { data, error } = await supabaseClient
        .from('account_balances')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) { console.error('[useSnapshot] balances:', error); throw error; }
      return data;
    },
  });

  const { data: installments = [], isLoading: loadingInstallments } = useQuery({
    queryKey: INSTALLMENTS_KEY,
    queryFn: async (): Promise<PendingInstallment[]> => {
      const { data, error } = await supabaseClient
        .from('pending_installments')
        .select('*')
        .order('bank_name', { ascending: true });
      if (error) { console.error('[useSnapshot] installments:', error); throw error; }
      return data;
    },
  });

  // Totais
  const totalBalance = balances.reduce((s, b) => s + b.balance, 0);

  // Quanto ainda falta pagar de cada parcelamento
  const remainingOf = (i: PendingInstallment) =>
    (i.total_installments - i.paid_installments) * i.installment_amount;

  const totalPendingDebt = installments.reduce((s, i) => s + remainingOf(i), 0);

  // Agrupa dívida pendente por banco
  const debtByBank = new Map<string, number>();
  for (const i of installments) {
    debtByBank.set(i.bank_name, (debtByBank.get(i.bank_name) ?? 0) + remainingOf(i));
  }

  const netWorth = totalBalance - totalPendingDebt;

  // ----- Mutations: saldos -----
  const upsertBalance = useMutation({
    mutationFn: async (data: BalanceFormData & { id?: string }) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      if (data.id) {
        const { error } = await supabaseClient.from('account_balances')
          .update({ bank_name: data.bank_name, balance: data.balance, updated_at: new Date().toISOString() })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseClient.from('account_balances')
          .insert({ bank_name: data.bank_name, balance: data.balance, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: BALANCES_KEY }); toast.success('Saldo salvo!'); },
    onError: () => toast.error('Erro ao salvar saldo.'),
  });

  const deleteBalance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient.from('account_balances').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: BALANCES_KEY }); toast.success('Removido.'); },
    onError: () => toast.error('Erro ao remover.'),
  });

  // ----- Mutations: parcelamentos -----
  const upsertInstallment = useMutation({
    mutationFn: async (data: InstallmentFormData & { id?: string }) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const payload = {
        description: data.description,
        bank_name: data.bank_name,
        installment_amount: data.installment_amount,
        total_installments: data.total_installments,
        paid_installments: data.paid_installments,
        due_day: data.due_day ?? null,
      };
      if (data.id) {
        const { error } = await supabaseClient.from('pending_installments').update(payload).eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseClient.from('pending_installments').insert({ ...payload, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: INSTALLMENTS_KEY }); toast.success('Parcelamento salvo!'); },
    onError: () => toast.error('Erro ao salvar parcelamento.'),
  });

  // Marca +1 parcela como paga
  const payInstallment = useMutation({
    mutationFn: async (item: PendingInstallment) => {
      const next = Math.min(item.paid_installments + 1, item.total_installments);
      const { error } = await supabaseClient.from('pending_installments')
        .update({ paid_installments: next }).eq('id', item.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: INSTALLMENTS_KEY }); toast.success('Parcela paga!'); },
    onError: () => toast.error('Erro ao atualizar.'),
  });

  const deleteInstallment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient.from('pending_installments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: INSTALLMENTS_KEY }); toast.success('Removido.'); },
    onError: () => toast.error('Erro ao remover.'),
  });

  return {
    balances,
    installments,
    totalBalance,
    totalPendingDebt,
    debtByBank: Array.from(debtByBank.entries()).map(([bank, total]) => ({ bank, total })),
    netWorth,
    remainingOf,
    isLoading: loadingBalances || loadingInstallments,
    upsertBalance,
    deleteBalance,
    upsertInstallment,
    payInstallment,
    deleteInstallment,
  };
}
