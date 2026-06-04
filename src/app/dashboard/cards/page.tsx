import { CardList } from '@/features/cards';

export const dynamic = 'force-dynamic';

export default function CardsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Cartões</h1>
      <CardList />
    </div>
  );
}
