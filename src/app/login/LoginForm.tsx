'use client';

import { useState } from 'react';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth';

const emailPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type EmailPasswordData = z.infer<typeof emailPasswordSchema>;

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido'),
});
type ForgotData = z.infer<typeof forgotSchema>;

export function LoginForm() {
  const { signInWithGitHub, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<'auth' | 'forgot'>('auth');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<EmailPasswordData>({ resolver: zodResolver(emailPasswordSchema) });
  const registerForm = useForm<EmailPasswordData>({ resolver: zodResolver(emailPasswordSchema) });
  const forgotForm = useForm<ForgotData>({ resolver: zodResolver(forgotSchema) });

  const handleLogin = async (data: EmailPasswordData) => {
    setIsSubmitting(true);
    await signInWithEmail(data.email, data.password);
    setIsSubmitting(false);
  };

  const handleRegister = async (data: EmailPasswordData) => {
    setIsSubmitting(true);
    await signUpWithEmail(data.email, data.password);
    setIsSubmitting(false);
  };

  const handleForgot = async (data: ForgotData) => {
    setIsSubmitting(true);
    const ok = await resetPassword(data.email);
    setIsSubmitting(false);
    if (ok) { forgotForm.reset(); setMode('auth'); }
  };

  if (mode === 'forgot') {
    return (
      <div className="w-full max-w-sm space-y-6">
        <Header />
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recuperar senha</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <form onSubmit={forgotForm.handleSubmit(handleForgot)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email">E-mail</Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...forgotForm.register('email')}
            />
            {forgotForm.formState.errors.email && (
              <p className="text-xs text-[var(--destructive)]">
                {forgotForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode('auth')}
          className="w-full text-center text-sm text-[var(--accent)] hover:underline"
        >
          ← Voltar ao login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <Header />

      {/* GitHub OAuth */}
      <Button
        variant="outline"
        className="w-full"
        onClick={signInWithGitHub}
        disabled={isSubmitting}
      >
        <svg className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        Entrar com GitHub
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-[var(--text-secondary)]">ou</span>
        <Separator className="flex-1" />
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="login" className="flex-1">Entrar</TabsTrigger>
          <TabsTrigger value="register" className="flex-1">Criar conta</TabsTrigger>
        </TabsList>

        {/* Login */}
        <TabsContent value="login">
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">E-mail</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...loginForm.register('email')}
              />
              {loginForm.formState.errors.email && (
                <p className="text-xs text-[var(--destructive)]">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Senha</Label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPasswordLogin ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-11"
                  {...loginForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordLogin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPasswordLogin ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPasswordLogin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-xs text-[var(--destructive)]">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </TabsContent>

        {/* Cadastro */}
        <TabsContent value="register">
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">E-mail</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...registerForm.register('email')}
              />
              {registerForm.formState.errors.email && (
                <p className="text-xs text-[var(--destructive)]">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Senha</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPasswordRegister ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="pr-11"
                  {...registerForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordRegister((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPasswordRegister ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPasswordRegister ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {registerForm.formState.errors.password && (
                <p className="text-xs text-[var(--destructive)]">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center space-y-2">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]">
          <Wallet className="h-7 w-7 text-white" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Finanças Pessoais</h1>
    </div>
  );
}
