create table public.fixed_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(12,2) not null check (amount > 0),
  due_day integer not null check (due_day >= 1 and due_day <= 31),
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_fixed_expenses_user on public.fixed_expenses(user_id, is_active);

alter table public.fixed_expenses enable row level security;

create policy "users_own_fixed_expenses" on public.fixed_expenses
  for all using (auth.uid() = user_id);
