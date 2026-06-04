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

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[useAuth] Erro no login:', error);
      if (error.message.includes('Invalid login credentials')) {
        toast.error('E-mail ou senha incorretos.');
      } else {
        toast.error('Erro ao entrar. Tente novamente.');
      }
      return false;
    }
    router.push('/dashboard');
    return true;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });
    if (error) {
      console.error('[useAuth] Erro no cadastro:', error);
      if (error.message.includes('already registered')) {
        toast.error('Este e-mail já está cadastrado.');
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }
      return false;
    }
    toast.success('Conta criada! Verifique seu e-mail para confirmar.');
    return true;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
    });
    if (error) {
      console.error('[useAuth] Erro ao enviar reset:', error);
      toast.error('Erro ao enviar e-mail de recuperação.');
      return false;
    }
    toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    return true;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (error) {
      console.error('[useAuth] Erro ao atualizar senha:', error);
      toast.error('Erro ao atualizar senha.');
      return false;
    }
    toast.success('Senha atualizada com sucesso!');
    router.push('/dashboard');
    return true;
  };

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    router.push('/login');
    toast.success('Sessão encerrada.');
  };

  return {
    user,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    updatePassword,
    signOut,
  };
}
