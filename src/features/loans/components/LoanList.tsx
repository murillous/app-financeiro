'use client';

import { useState } from 'react';
import { Plus, Check, Trash2, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useLoans } from '../hooks/useLoans';
import { LoanForm } from './LoanForm';
import type { LoanFormData } from '../hooks/useLoans';
import type { Loan } from '../types';

const METHOD_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  transferencia: 'Transferência',
  cheque: 'Cheque',
};

const METHOD_COLORS: Record<string, string> = {
  dinheiro: 'text-[var(--success)]',
  pix: 'text-[var(--accent)]',
  transferencia: 'text-[var(--warning)]',
  cheque: 'text-[var(--text-secondary)]',
};

function LoanCard({ loan, onSettle, onDelete }: {
  loan: Loan;
  onSettle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue = loan.due_date && loan.status === 'pendente' && new Date(loan.due_date) < new Date();

  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-[var(--text-primary)]">{loan.person_name}</p>
          <Badge variant="secondary" className={METHOD_COLORS[loan.payment_method]}>
            {METHOD_LABELS[loan.payment_method]}
          </Badge>
          {loan.status === 'quitado' && <Badge variant="success">Quitado</Badge>}
        </div>
        <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">{loan.description}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-[var(--text-secondary)]">Emprestado em {formatDate(loan.date)}</span>
          {loan.due_date && (
            <span className={`text-xs ${isOverdue ? 'text-[var(--destructive)] font-medium' : 'text-[var(--text-secondary)]'}`}>
              · Prazo: {formatDate(loan.due_date)}{isOverdue && ' (vencido)'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="font-semibold text-[var(--text-primary)] mr-1">{formatCurrency(loan.amount)}</span>
        {loan.status === 'pendente' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSettle(loan.id)}
            aria-label="Marcar como quitado"
            className="text-[var(--success)]"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(loan.id)}
          aria-label="Remover empréstimo"
          className="text-[var(--destructive)]"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function LoanList() {
  const { pending, settled, totalPending, isLoading, createLoan, markAsSettled, deleteLoan } = useLoans();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = (data: LoanFormData) => {
    createLoan.mutate(data, { onSuccess: () => setIsOpen(false) });
  };

  if (isLoading) {
    return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Empréstimos</h2>
          {pending.length > 0 && (
            <p className="text-sm text-[var(--text-secondary)]">
              A receber: <span className="text-[var(--accent)] font-medium">{formatCurrency(totalPending)}</span>
            </p>
          )}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Novo Empréstimo</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Empréstimo</DialogTitle>
            </DialogHeader>
            <LoanForm onSubmit={handleCreate} isLoading={createLoan.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pendente">
        <TabsList className="w-full">
          <TabsTrigger value="pendente" className="flex-1">
            A receber ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="quitado" className="flex-1">
            Quitados ({settled.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendente">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-secondary)]">
              <Banknote className="h-8 w-8 opacity-30" />
              <p>Nenhum empréstimo pendente.</p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {pending.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onSettle={(id) => markAsSettled.mutate(id)}
                  onDelete={(id) => { if (confirm('Remover este empréstimo?')) deleteLoan.mutate(id); }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quitado">
          {settled.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-secondary)]">
              <Banknote className="h-8 w-8 opacity-30" />
              <p>Nenhum empréstimo quitado ainda.</p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {settled.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onSettle={(id) => markAsSettled.mutate(id)}
                  onDelete={(id) => { if (confirm('Remover este empréstimo?')) deleteLoan.mutate(id); }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
