-- Insere as novas categorias para usuários existentes (ignora duplicatas)
INSERT INTO public.categories (user_id, name, icon, color, is_default)
SELECT u.id, c.name, c.icon, c.color, true
FROM auth.users u
CROSS JOIN (VALUES
  ('Relacionamento', '❤️', '#EC4899'),
  ('Tecnologia',     '💻', '#6366F1'),
  ('Livros',         '📖', '#F59E0B')
) AS c(name, icon, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories
  WHERE user_id = u.id AND name = c.name
);

-- Atualiza a função do trigger para incluir as novas categorias
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, icon, color, is_default) VALUES
    (new.id, 'Alimentação',    '🍔', '#F59E0B', true),
    (new.id, 'Transporte',     '🚗', '#3B82F6', true),
    (new.id, 'Saúde',          '🏥', '#EF4444', true),
    (new.id, 'Lazer',          '🎮', '#8B5CF6', true),
    (new.id, 'Moradia',        '🏠', '#10B981', true),
    (new.id, 'Educação',       '📚', '#06B6D4', true),
    (new.id, 'Vestuário',      '👕', '#EC4899', true),
    (new.id, 'Assinaturas',    '📱', '#6366F1', true),
    (new.id, 'Investimentos',  '📈', '#22C55E', true),
    (new.id, 'Relacionamento', '❤️', '#EC4899', true),
    (new.id, 'Tecnologia',     '💻', '#6366F1', true),
    (new.id, 'Livros',         '📖', '#F59E0B', true),
    (new.id, 'Outros',         '📦', '#A0A0A0', true);
  RETURN new;
END;
$$;
