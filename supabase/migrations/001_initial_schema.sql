-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- Tabela: categories (categorias de gastos)
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default '📦',
  color text not null default '#6366F1',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- Tabela: cards (cartões)
create table public.cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  bank text not null,
  color text not null default '#3B82F6',
  credit_limit numeric(12,2),
  created_at timestamptz not null default now()
);

-- Tabela: incomes (rendas)
create table public.incomes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  source text not null,
  date date not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Tabela: transactions (gastos/transações)
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  payment_method text not null check (payment_method in ('pix','debito','credito')),
  card_id uuid references public.cards(id) on delete set null,
  date date not null,
  installments integer not null default 1 check (installments >= 1 and installments <= 48),
  installment_number integer check (installment_number >= 1),
  parent_transaction_id uuid references public.transactions(id) on delete cascade,
  notes text,
  is_recurring boolean not null default false,
  attachment_url text,
  created_at timestamptz not null default now()
);

-- Tabela: debt_reminders (lembretes de dívidas)
create table public.debt_reminders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  person_name text not null,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  direction text not null check (direction in ('eu_devo','me_devem')),
  due_date date,
  notes text,
  is_settled boolean not null default false,
  settled_at timestamptz,
  linked_transaction_id uuid references public.transactions(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Índices de performance
create index idx_incomes_user_date on public.incomes(user_id, date);
create index idx_transactions_user_date on public.transactions(user_id, date);
create index idx_transactions_parent on public.transactions(parent_transaction_id);
create index idx_debt_reminders_user on public.debt_reminders(user_id, is_settled);

-- RLS: Habilita Row Level Security em todas as tabelas
alter table public.categories enable row level security;
alter table public.cards enable row level security;
alter table public.incomes enable row level security;
alter table public.transactions enable row level security;
alter table public.debt_reminders enable row level security;

-- Políticas RLS: usuário só acessa seus próprios dados
create policy "users_own_categories" on public.categories
  for all using (auth.uid() = user_id);

create policy "users_own_cards" on public.cards
  for all using (auth.uid() = user_id);

create policy "users_own_incomes" on public.incomes
  for all using (auth.uid() = user_id);

create policy "users_own_transactions" on public.transactions
  for all using (auth.uid() = user_id);

create policy "users_own_debt_reminders" on public.debt_reminders
  for all using (auth.uid() = user_id);
