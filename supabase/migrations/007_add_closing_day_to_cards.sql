ALTER TABLE public.cards
ADD COLUMN closing_day integer CHECK (closing_day >= 1 AND closing_day <= 31);
