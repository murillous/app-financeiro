'use client';

import { useState } from 'react';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<'auth' | 'forgot'>('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<EmailPasswordData>({
    resolver: zodResolver(emailPasswordSchema),
  });
  const registerForm = useForm<EmailPasswordData>({
    resolver: zodResolver(emailPasswordSchema),
  });
  const forgotForm = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
  });

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
    if (ok) {
      forgotForm.reset();
      setMode('auth');
    }
  };

  if (mode === 'forgot') {
    return (
      <div className="w-full max-w-sm space-y-6">
        <Header />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recuperar senha</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Informe seu e-mail e enviaremos um link para redefinir a senha.
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
              <Label htmlFor="login-password">Senha</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-11"
                  {...loginForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-xs text-[var(--destructive)]">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Esqueci minha senha
            </button>

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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="pr-11"
                  {...registerForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
