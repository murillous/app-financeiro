import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Singleton lazy — não instancia no module load (evita falha em build sem env vars)
let _client: ReturnType<typeof createBrowserClient> | null = null;

export const supabase = new Proxy(
  {} as ReturnType<typeof createBrowserClient>,
  {
    get(_, prop) {
      if (!_client) _client = createClient();
      return (_client as Record<string | symbol, unknown>)[prop];
    },
  },
);
