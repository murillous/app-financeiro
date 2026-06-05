'use client';

import { useState } from 'react';
import { Plus, Check, Trash2, Banknote, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useLoans } from '../hooks/useLoans';
import { LoanForm } from './LoanForm';
import type { LoanFormData, CardCharge } from '../hooks/useLoans';
import type { Loan } from '../types';

const METHOD_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro', pix: 'Pix', transferencia: 'Transferência', cheque: 'Cheque',
  credito: 'Crédito', debito: 'Débito',
};

function LoanCard({ loan, onSettle, onDelete }: {
  loan: Loan; onSettle: (id: string) => void; onDelete: (id: string) => void;
}) {
  const isOverdue = loan.due_date && loan.status === 'pendente' && new Date(loan.due_date) < new Date();
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-[var(--text-primary)]">{loan.person_name}</p>
          <Badge variant="secondary">{METHOD_LABELS[loan.payment_method] ?? loan.payment_method}</Badge>
          {loan.status === 'quitado' && <Badge variant="success">Quitado</Badge>}
        </div>
        <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">{loan.description}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="text-xs text-[var(--text-secondary)]">{formatDate(loan.date)}</span>
          {loan.due_date && (
            <span className={`text-xs ${isOverdue ? 'text-[var(--destructive)] font-medium' : 'text-[var(--text-secondary)]'}`}>
              · Prazo: {formatDate(loan.due_date)}{isOverdue && ' ⚠'}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="font-semibold text-[var(--text-primary)] mr-1">{formatCurrency(loan.amount)}</span>
        {loan.status === 'pendente' && (
          <Button variant="ghost" size="icon" onClick={() => onSettle(loan.id)} className="text-[var(--success)]" aria-label="Quitar">
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => onDelete(loan.id)} className="text-[var(--destructive)]" aria-label="Remover">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ChargeCard({ charge, onSettle }: { charge: CardCharge; onSettle: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-[var(--text-primary)]">{charge.payer_name}</p>
          {charge.card_name && (
            <Badge variant="secondary">
              <CreditCard className="h-3 w-3 mr-1" />{charge.card_name}
            </Badge>
          )}
          {charge.installments > 1 && <Badge variant="outline">{charge.installments}x</Badge>}
        </div>
        <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">{charge.description}</p>
        <span className="text-xs text-[var(--text-secondary)]">{formatDate(charge.date)}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="font-semibold text-[var(--text-primary)] mr-1">{formatCurrency(charge.amount)}</span>
        <Button variant="ghost" size="icon" onClick={() => onSettle(charge.id)} className="text-[var(--success)]" aria-label="Marcar como recebido">
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function LoanList() {
  const { pending, settled, totalPending, cardCharges, totalCharges, isLoading, createLoan, markAsSettled, deleteLoan, settleCharge } = useLoans();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  const totalAReceber = totalPending + totalCharges;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Empréstimos</h2>
          {totalAReceber > 0 && (
            <p className="text-sm text-[var(--text-secondary)]">
              Total a receber: <span className="text-[var(--accent)] font-medium">{formatCurrency(totalAReceber)}</span>
            </p>
          )}
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" /><span className="hidden sm:inline ml-1">Novo Empréstimo</span></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Empréstimo</DialogTitle></DialogHeader>
            <LoanForm onSubmit={(d: LoanFormData) => createLoan.mutate(d, { onSuccess: () => setIsOpen(false) })} isLoading={createLoan.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pendente">
        <TabsList className="w-full">
          <TabsTrigger value="pendente" className="flex-1">
            Empréstimos ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="cobrar" className="flex-1">
            Cobrar do cartão {cardCharges.length > 0 && `(${cardCharges.length})`}
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
              {pending.map((l) => (
                <LoanCard key={l.id} loan={l}
                  onSettle={(id) => markAsSettled.mutate(id)}
                  onDelete={(id) => { if (confirm('Remover?')) deleteLoan.mutate(id); }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cobrar">
          <div className="mt-2 mb-3 rounded-md bg-[var(--surface)] border border-[var(--border)] p-3 text-sm text-[var(--text-secondary)]">
            Gastos no cartão registrados em nome de outra pessoa. Quando receber o dinheiro, marque como recebido.
          </div>
          {cardCharges.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-secondary)]">
              <CreditCard className="h-8 w-8 opacity-30" />
              <p>Nenhum gasto de terceiros pendente.</p>
              <p className="text-xs text-center">Ao registrar um gasto com campo "Comprado por" preenchido, ele aparece aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cardCharges.map((c) => (
                <ChargeCard key={c.id} charge={c} onSettle={(id) => settleCharge.mutate(id)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quitado">
          {settled.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-secondary)]">
              <Banknote className="h-8 w-8 opacity-30" />
              <p>Nenhum quitado ainda.</p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {settled.map((l) => (
                <LoanCard key={l.id} loan={l}
                  onSettle={(id) => markAsSettled.mutate(id)}
                  onDelete={(id) => { if (confirm('Remover?')) deleteLoan.mutate(id); }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
