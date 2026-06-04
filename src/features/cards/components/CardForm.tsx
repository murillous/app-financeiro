'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cardSchema, CARD_COLORS, type CardFormData, type CardFormInput } from '@/lib/validations/cards';
import { cn } from '@/lib/utils';
import type { Card } from '../types';

interface CardFormProps {
  defaultValues?: Partial<Card>;
  onSubmit: (data: CardFormData) => void;
  isLoading?: boolean;
}

export function CardForm({ defaultValues, onSubmit, isLoading }: CardFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CardFormInput, unknown, CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      bank: defaultValues?.bank ?? '',
      color: defaultValues?.color ?? '#3B82F6',
      credit_limit: defaultValues?.credit_limit ?? undefined,
    },
  });

  const selectedColor = watch('color');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome do Cartão</Label>
        <Input id="name" placeholder="Ex: Nubank, Inter..." {...register('name')} />
        {errors.name && <p className="text-xs text-[var(--destructive)]">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bank">Banco / Instituição</Label>
        <Input id="bank" placeholder="Ex: Nubank, Itaú..." {...register('bank')} />
        {errors.bank && <p className="text-xs text-[var(--destructive)]">{errors.bank.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          {CARD_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                selectedColor === color ? 'border-white scale-110' : 'border-transparent',
              )}
              style={{ backgroundColor: color }}
              aria-label={`Cor ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="credit_limit">Limite de Crédito (opcional)</Label>
        <Input
          id="credit_limit"
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          {...register('credit_limit', { valueAsNumber: true })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : defaultValues ? 'Atualizar Cartão' : 'Criar Cartão'}
      </Button>
    </form>
  );
}
