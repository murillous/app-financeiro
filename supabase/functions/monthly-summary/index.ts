import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  topCategories: Array<{ name: string; total: number; color: string }>;
}

Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const url = new URL(req.url);
    const month = parseInt(url.searchParams.get('month') ?? String(new Date().getMonth() + 1));
    const year = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear()));

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const [incomeRes, expenseRes, categoryRes] = await Promise.all([
      supabase.from('incomes').select('amount').gte('date', startDate).lte('date', endDate),
      supabase
        .from('transactions')
        .select('amount, installments')
        .gte('date', startDate)
        .lte('date', endDate)
        .is('parent_transaction_id', null),
      supabase
        .from('transactions')
        .select('amount, installments, categories(name, color)')
        .gte('date', startDate)
        .lte('date', endDate)
        .is('parent_transaction_id', null),
    ]);

    const totalIncome = (incomeRes.data ?? []).reduce((s: number, r: { amount: number }) => s + r.amount, 0);
    const totalExpenses = (expenseRes.data ?? []).reduce(
      (s: number, r: { amount: number; installments: number }) => s + r.amount * r.installments,
      0,
    );

    // Agrupa por categoria
    const catMap = new Map<string, { name: string; color: string; total: number }>();
    for (const tx of categoryRes.data ?? []) {
      const cat = (tx as unknown as { categories: { name: string; color: string } }).categories;
      if (!cat) continue;
      const existing = catMap.get(cat.name);
      const total = (tx.amount as number) * (tx.installments as number);
      if (existing) {
        existing.total += total;
      } else {
        catMap.set(cat.name, { name: cat.name, color: cat.color, total });
      }
    }

    const topCategories = Array.from(catMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const summary: MonthlySummary = {
      month,
      year,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      topCategories,
    };

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[monthly-summary] Erro:', err);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
