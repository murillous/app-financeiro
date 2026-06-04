import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 bg-[var(--background)]">
      <WifiOff className="h-16 w-16 text-[var(--text-secondary)]" />
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Sem conexão</h1>
      <p className="text-center text-[var(--text-secondary)]">
        Verifique sua conexão com a internet e tente novamente.
      </p>
    </main>
  );
}
