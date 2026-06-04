import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export function useAuth(supabaseClient: SupabaseClient = supabase) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient]);

  const signInWithGitHub = async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      console.error('[useAuth] Erro no login com GitHub:', error);
      toast.error('Erro ao entrar com GitHub. Tente novamente.');
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      console.error('[useAuth] Erro no login com Google:', error);
      toast.error('Erro ao entrar com Google. Tente novamente.');
    }
  };

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    router.push('/login');
    toast.success('Sessão encerrada.');
  };

  return { user, isLoading, signInWithGitHub, signInWithGoogle, signOut };
}
