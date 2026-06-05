-- Campo opcional: quem fez a compra (null = o próprio usuário)
ALTER TABLE public.transactions
ADD COLUMN payer_name text DEFAULT NULL;
