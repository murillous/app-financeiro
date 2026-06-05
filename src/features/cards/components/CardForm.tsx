'use client';

import { useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pipette } from 'lucide-react';
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
  const colorInputRef = useRef<HTMLInputElement>(null);

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
      closing_day: defaultValues?.closing_day ?? undefined,
    },
  });

  const selectedColor = watch('color');
  const isPreset = CARD_COLORS.includes(selectedColor as typeof CARD_COLORS[number]);

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
        <div className="flex flex-wrap items-center gap-2">
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

          {/* Seletor de cor personalizado */}
          <div className="relative">
            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center overflow-hidden',
                !isPreset ? 'border-white scale-110' : 'border-transparent',
              )}
              style={{ backgroundColor: isPreset ? '#444' : selectedColor }}
              aria-label="Cor personalizada"
              title="Escolher cor personalizada"
            >
              {isPreset && <Pipette className="h-3.5 w-3.5 text-white" />}
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={selectedColor}
              onChange={(e) => setValue('color', e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              aria-label="Seletor de cor"
              tabIndex={-1}
            />
          </div>
        </div>

        {/* Preview da cor selecionada */}
        <div className="flex items-center gap-2 mt-1">
          <div className="h-5 w-5 rounded-full border border-[var(--border)]" style={{ backgroundColor: selectedColor }} />
          <span className="text-xs text-[var(--text-secondary)] font-mono">{selectedColor}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="credit_limit">Limite (opcional)</Label>
          <Input
            id="credit_limit"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            {...register('credit_limit', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="closing_day">Fechamento da fatura</Label>
          <Input
            id="closing_day"
            type="number"
            min="1"
            max="31"
            placeholder="Ex: 5"
            {...register('closing_day', { valueAsNumber: true })}
          />
          {errors.closing_day && <p className="text-xs text-[var(--destructive)]">{errors.closing_day.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : defaultValues ? 'Atualizar Cartão' : 'Criar Cartão'}
      </Button>
    </form>
  );
}
