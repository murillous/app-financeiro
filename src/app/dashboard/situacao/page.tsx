import { SnapshotView } from '@/features/snapshot';

export const dynamic = 'force-dynamic';

export default function SituacaoPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Raio-X Financeiro</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Seu estado atual: saldo em conta e parcelas que ainda faltam pagar.
        </p>
      </div>
      <SnapshotView />
    </div>
  );
}
