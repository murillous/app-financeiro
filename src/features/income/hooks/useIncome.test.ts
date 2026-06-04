import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIncome } from './useIncome';

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

const mockSupabase = {
  from: vi.fn(),
  auth: { getUser: vi.fn() },
} as unknown as NonNullable<Parameters<typeof useIncome>[2]>;

beforeEach(() => vi.clearAllMocks());

describe('useIncome', () => {
  it('calcula totalIncome corretamente', async () => {
    const incomes = [
      { id: '1', amount: 3000, date: '2025-06-10', source: 'trabalho', description: 'Salário', user_id: 'u1', notes: null, created_at: '' },
      { id: '2', amount: 500, date: '2025-06-15', source: 'freelance', description: 'Projeto', user_id: 'u1', notes: null, created_at: '' },
    ];

    (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: incomes, error: null }),
    });

    const { result } = renderHook(() => useIncome(6, 2025, mockSupabase), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.totalIncome).toBe(3500);
    expect(result.current.incomes).toHaveLength(2);
  });
});
