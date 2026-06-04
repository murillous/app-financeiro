import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Category } from '@/features/shared/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

const QUERY_KEY = ['categories'] as const;

export function useCategories(supabaseClient: SupabaseClient = supabase) {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('[useCategories] Erro ao buscar categorias:', error);
        throw error;
      }
      return data;
    },
    staleTime: 1000 * 60 * 10, // categorias mudam pouco
  });

  return { categories, isLoading };
}
