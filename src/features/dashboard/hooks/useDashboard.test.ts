import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDashboard } from './useDashboard';

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

const mockSupabase = {
  from: vi.fn(),
} as unknown as NonNullable<Parameters<typeof useDashboard>[2]>;

beforeEach(() => vi.clearAllMocks());

describe('useDashboard', () => {
  it('calcula balance corretamente', async () => {
    let callCount = 0;
    (mockSupabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
      if (table === 'incomes') {
        return {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockResolvedValue({ data: [{ amount: 3000 }], error: null }),
        };
      }
      if (table === 'transactions') {
        callCount++;
        return {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          is: vi.fn().mockResolvedValue({
            data: [{ amount: 100, installments: 2, categories: { name: 'Alimentação', color: '#10B981' } }],
            error: null,
          }),
        };
      }
    });

    const { result } = renderHook(() => useDashboard(6, 2025, mockSupabase), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    expect(result.current.summary?.totalIncome).toBe(3000);
    expect(result.current.summary?.totalExpenses).toBe(200); // 100 * 2
    expect(result.current.summary?.balance).toBe(2800);
  });
});
