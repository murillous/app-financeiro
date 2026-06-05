-- Saldo em conta por banco
create table public.account_balances (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  bank_name text not null,
  balance numeric(12,2) not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_account_balances_user on public.account_balances(user_id);
alter table public.account_balances enable row level security;
create policy "users_own_account_balances" on public.account_balances
  for all using (auth.uid() = user_id);

-- Parcelamentos em andamento (snapshot do estado atual)
create table public.pending_installments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  bank_name text not null,
  installment_amount numeric(12,2) not null check (installment_amount > 0),
  total_installments integer not null check (total_installments >= 1),
  paid_installments integer not null default 0 check (paid_installments >= 0),
  due_day integer check (due_day >= 1 and due_day <= 31),
  created_at timestamptz not null default now()
);

create index idx_pending_installments_user on public.pending_installments(user_id);
alter table public.pending_installments enable row level security;
create policy "users_own_pending_installments" on public.pending_installments
  for all using (auth.uid() = user_id);
