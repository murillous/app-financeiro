import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, locale = 'pt-BR', currency = 'BRL'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

// Parseia string "YYYY-MM-DD" como horário LOCAL (não UTC) para evitar
// o off-by-one que acontece com new Date("YYYY-MM-DD") em timezones < UTC.
function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date: Date | string, locale = 'pt-BR'): string {
  const d = typeof date === 'string' ? parseDateLocal(date) : date;
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export function formatMonth(date: Date | string, locale = 'pt-BR'): string {
  const d = typeof date === 'string' ? parseDateLocal(date) : date;
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(d);
}

// Retorna "YYYY-MM-DD" usando horário local (evita UTC -1 dia)
export function todayLocalString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Último dia do mês como "YYYY-MM-DD" em horário local
export function lastDayOfMonthString(year: number, month: number): string {
  const last = new Date(year, month, 0); // dia 0 do próximo mês = último dia deste
  const y = last.getFullYear();
  const m = String(last.getMonth() + 1).padStart(2, '0');
  const d = String(last.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
