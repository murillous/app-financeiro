# Finanças Pessoais

PWA para gestão financeira pessoal — controle de gastos, rendas, cartões e lembretes de dívidas

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Estado:** TanStack Query + Zustand
- **UI:** Componentes customizados inspirados em shadcn/ui
- **PWA:** next-pwa (Workbox)
- **Testes:** Vitest + React Testing Library

## Setup

### 1. Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com)

### 2. Clone e instale

```bash
git clone <repo>
cd "app financeiro"
npm install
```

### 3. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha com suas credenciais do projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Banco de dados

Execute as migrations no painel SQL do Supabase ou via CLI:

```bash
supabase db push
```

Ordem: `001_initial_schema.sql` → `002_default_categories.sql`

### 5. OAuth (GitHub e Google)

No painel Supabase → Authentication → Providers, ative GitHub e Google com Client ID + Secret.

URL de callback: `https://seu-projeto.supabase.co/auth/v1/callback`

### 6. Edge Functions

```bash
supabase functions deploy monthly-summary
```

Uso: `GET /functions/v1/monthly-summary?month=6&year=2025`

### 7. Desenvolvimento

```bash
npm run dev
```

### 8. Testes

```bash
npm run test              # Executa uma vez
npm run test:watch        # Modo watch
npm run test:coverage     # Com relatório de cobertura
```

## Estrutura

```
src/
  features/
    auth/         # Login OAuth, hook useAuth
    cards/        # Cartões: useCards, CardList, CardForm
    income/       # Rendas: useIncome, IncomeList
    expenses/     # Gastos: useExpenses, useCategories, ExpenseList
    debts/        # Lembretes: useDebts, DebtList
    dashboard/    # Resumo: useDashboard, SummaryCards, gráficos
    shared/       # ThemeToggle, BottomNav, Sidebar
  lib/
    supabase/     # Clientes browser/server/middleware
    validations/  # Schemas Zod
    utils.ts      # cn, formatCurrency, formatDate
  app/            # Rotas Next.js
  components/ui/  # Componentes base (Button, Card, etc.)
supabase/
  migrations/     # SQL migrations
  functions/      # Edge Functions (Deno)
```
