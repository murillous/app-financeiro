import { LoanList } from '@/features/loans';

export const dynamic = 'force-dynamic';

export default function LoansPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <LoanList />
    </div>
  );
}
