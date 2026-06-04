import { DebtList } from '@/features/debts';

export default function DebtsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Lembretes de Dívidas</h1>
      <DebtList />
    </div>
  );
}
