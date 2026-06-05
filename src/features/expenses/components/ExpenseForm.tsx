'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  expenseSchema,
  PAYMENT_METHODS,
  type ExpenseFormData,
  type ExpenseFormInput,
} from '@/lib/validations/expenses';
import { useCategories } from '../hooks/useCategories';
import { useCards } from '@/features/cards/hooks/useCards';

const METHOD_LABELS: Record<string, string> = {
  pix: 'Pix',
  debito: 'Débito',
  credito: 'Crédito',
};

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  isLoading?: boolean;
}

export function ExpenseForm({ onSubmit, isLoading }: ExpenseFormProps) {
  const { categories } = useCategories();
  const { cards } = useCards();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      payment_method: 'pix',
      installments: 1,
      is_recurring: false,
    },
  });

  const paymentMethod = useWatch({ control, name: 'payment_method' });
  const isCredit = paymentMethod === 'credito';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="exp-desc">Descrição</Label>
        <Input id="exp-desc" placeholder="Ex: Mercado, Netflix..." {...register('description')} />
        {errors.description && <p className="text-xs text-[var(--destructive)]">{errors.description.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="exp-amount">Valor Total (R$)</Label>
        <Input
          id="exp-amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0,00"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <p className="text-xs text-[var(--destructive)]">{errors.amount.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select onValueChange={(val) => setValue('category_id', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && <p className="text-xs text-[var(--destructive)]">{errors.category_id.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Forma de Pagamento</Label>
          <Select
            defaultValue="pix"
            onValueChange={(val) => {
              setValue('payment_method', val as ExpenseFormData['payment_method']);
              if (val !== 'credito') {
                setValue('installments', 1);
                setValue('card_id', null);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>{METHOD_LABELS[m]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isCredit && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Cartão</Label>
            <Select onValueChange={(val) => setValue('card_id', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="installments">Parcelas</Label>
            <Input
              id="installments"
              type="number"
              min="1"
              max="48"
              {...register('installments', { valueAsNumber: true })}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="exp-date">Data</Label>
        <Input id="exp-date" type="date" {...register('date')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="payer_name">
          Comprado por (opcional)
          <span className="ml-1 text-xs text-[var(--text-secondary)]">— deixe vazio se foi você</span>
        </Label>
        <Input
          id="payer_name"
          placeholder="Ex: Mãe, Pai, João..."
          {...register('payer_name')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="exp-notes">Observações (opcional)</Label>
        <Input id="exp-notes" placeholder="..." {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Registrar Gasto'}
      </Button>
    </form>
  );
}
