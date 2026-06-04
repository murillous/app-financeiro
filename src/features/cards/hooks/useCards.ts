import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { CardFormData } from '@/lib/validations/cards';
import type { Card } from '../types';
import type { SupabaseClient } from '@supabase/supabase-js';

const QUERY_KEY = ['cards'] as const;

// Aceita cliente Supabase como parâmetro para permitir injeção em testes
export function useCards(supabaseClient: SupabaseClient = supabase) {
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Card[]> => {
      const { data, error } = await supabaseClient
        .from('cards')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[useCards] Erro ao buscar cartões:', error);
        throw error;
      }
      return data;
    },
  });

  const createCard = useMutation({
    mutationFn: async (formData: CardFormData) => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabaseClient
        .from('cards')
        .insert({ ...formData, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('[useCards] Erro ao criar cartão:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Cartão criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar cartão. Tente novamente.'),
  });

  const updateCard = useMutation({
    mutationFn: async ({ id, ...formData }: CardFormData & { id: string }) => {
      const { data, error } = await supabaseClient
        .from('cards')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[useCards] Erro ao atualizar cartão:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Cartão atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar cartão.'),
  });

  const deleteCard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseClient.from('cards').delete().eq('id', id);
      if (error) {
        console.error('[useCards] Erro ao remover cartão:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Cartão removido.');
    },
    onError: () => toast.error('Erro ao remover cartão.'),
  });

  return {
    cards,
    isLoading,
    error,
    createCard,
    updateCard,
    deleteCard,
  };
}
