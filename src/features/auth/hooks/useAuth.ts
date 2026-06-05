import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { User, SupabaseClient } from '@supabase/supabase-js';

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

  const getOrigin = () =>
    typeof window !== 'undefined' ? window.location.origin : '';

  const signInWithGitHub = async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${getOrigin()}/auth/callback` },
    });
    if (error) {
      console.error('[useAuth] Erro GitHub OAuth:', error);
      toast.error('Erro ao entrar com GitHub.');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[useAuth] Erro login:', error);
      if (error.message.includes('Invalid login credentials')) {
        toast.error('E-mail ou senha incorretos.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Confirme seu e-mail antes de entrar. Verifique a caixa de entrada.');
      } else {
        toast.error('Erro ao entrar. Tente novamente.');
      }
      return false;
    }
    router.push('/dashboard');
    return true;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getOrigin()}/auth/callback`,
      },
    });
    if (error) {
      console.error('[useAuth] Erro cadastro:', error);
      if (error.message.includes('already registered')) {
        toast.error('Este e-mail já está cadastrado.');
      } else {
        toast.error('Erro ao criar conta. Tente novamente.');
      }
      return false;
    }

    // Se confirmação de e-mail está desativada, já loga direto
    if (data.session) {
      router.push('/dashboard');
      toast.success('Conta criada! Bem-vindo.');
    } else {
      toast.success('Conta criada! Verifique seu e-mail para confirmar.');
    }
    return true;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${getOrigin()}/auth/reset-password`,
    });
    if (error) {
      console.error('[useAuth] Erro reset senha:', error);
      toast.error('Erro ao enviar e-mail de recuperação.');
      return false;
    }
    toast.success('Link enviado! Verifique sua caixa de entrada (e o spam).');
    return true;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (error) {
      console.error('[useAuth] Erro update senha:', error);
      toast.error('Erro ao atualizar senha.');
      return false;
    }
    toast.success('Senha atualizada!');
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
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    updatePassword,
    signOut,
  };
}
