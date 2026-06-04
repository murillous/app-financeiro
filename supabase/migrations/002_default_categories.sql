-- Função que insere categorias padrão ao criar usuário
create or replace function public.handle_new_user_categories()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.categories (user_id, name, icon, color, is_default) values
    (new.id, 'Alimentação',    '🍔', '#F59E0B', true),
    (new.id, 'Transporte',     '🚗', '#3B82F6', true),
    (new.id, 'Saúde',          '🏥', '#EF4444', true),
    (new.id, 'Lazer',          '🎮', '#8B5CF6', true),
    (new.id, 'Moradia',        '🏠', '#10B981', true),
    (new.id, 'Educação',       '📚', '#06B6D4', true),
    (new.id, 'Vestuário',      '👕', '#EC4899', true),
    (new.id, 'Assinaturas',    '📱', '#6366F1', true),
    (new.id, 'Investimentos',  '📈', '#22C55E', true),
    (new.id, 'Outros',         '📦', '#A0A0A0', true);
  return new;
end;
$$;

-- Trigger: chama a função ao inserir novo usuário
create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute procedure public.handle_new_user_categories();
