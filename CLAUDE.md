# CLAUDE.md — Guia Obrigatório para Agentes de IA

> Leia este arquivo inteiro antes de tocar em qualquer código do **Finanças Pessoais**.  
> Ele define como você deve pensar, decidir e escrever neste projeto.

---

## O que é este sistema

Sistema web de finanças pessoais construído com **Next.js (App Router) + Supabase**. O frontend é em React/TypeScript, com arquitetura feature-based e custom hooks para testabilidade. Backend delegado ao Supabase (PostgreSQL, Edge Functions em Deno, Storage). O projeto prioriza **design escuro, minimalista e intuitivo**.

---

## Mentalidade Esperada

**Pense como um desenvolvedor frontend sênior com foco em experiência do usuário e testabilidade.** Cada decisão deve considerar:

- **Manutenibilidade:** código legível, baixo acoplamento, fácil de modificar.
- **Testabilidade:** lógica de negócio isolada em hooks que podem ser testados sem renderizar componentes.
- **Performance:** evitar re-renderizações desnecessárias, usar React Query para cache e sincronização.
- **Segurança:** respeitar RLS do Supabase, nunca expor chaves de serviço no cliente.

> **Regra de ouro:** Se você precisa acessar Supabase diretamente dentro de um componente, provavelmente está errado. Crie um custom hook.

---

## Convenções Absolutas (Nunca Viole)

| Regra | Detalhe |
|---|---|
| Linguagem dos comentários | Português (PT-BR) |
| Módulos | ESM — `import/export`, nunca `require/module.exports` |
| Exports | Named exports apenas — **nunca** `default export` |
| Nomenclatura | `camelCase` (variáveis/funções) \| `PascalCase` (componentes/classes) \| `UPPER_SNAKE` (constantes) |
| Arquivos de componente | `NomePascalCase.tsx` |
| Arquivos de hook | `useNomeCamelCase.ts` |
| Arquivos de serviço/utilitário | `nomeCamelCase.ts` |
| Erros | Nunca engula silenciosamente — log + rethrow (Edge Functions) ou log + fallback explícito (frontend) |

---

## Estrutura de Código e Separação de Responsabilidades

```
src/features/feature-name/
├── components/   # Componentes React específicos dessa feature
├── hooks/        # Custom hooks (ex: useFeatureData, useFeatureMutations)
├── services/     # Lógica pura que não depende de React (opcional)
├── types/        # TypeScript interfaces/types locais
└── index.ts      # Exporta o que é público (componentes principais, hooks)
```

### Padrão para custom hooks

```ts
// hooks/useCards.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Card } from '../types';

// Aceita cliente Supabase como parâmetro opcional para testes
export function useCards(supabaseClient = supabase) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      const { data } = await supabaseClient.from('cards').select('*');
      setCards(data ?? []);
      setLoading(false);
    }
    fetchCards();
  }, [supabaseClient]);

  const addCard = async (newCard: Omit<Card, 'id'>) => {
    const { data } = await supabaseClient.from('cards').insert(newCard).select();
    setCards((prev) => [...prev, ...(data ?? [])]);
    return data?.[0];
  };

  return { cards, loading, addCard };
}
```

---

## Injeção de Dependência Implícita (Frontend)

```ts
// ✅ Bom
export function useExpenses(supabaseClient = supabase) { ... }

// ❌ Ruim (não testável sem mock global)
export function useExpenses() {
  const supabase = useContext(SupabaseContext); // acoplamento
}
```

---

## Edge Functions (Deno)

- Cada Edge Function fica em `supabase/functions/<nome>/index.ts`.
- Use `createClient` com o header de autorização recebido para autenticar.
- Retorne sempre JSON com status HTTP adequado.
- Teste local: `supabase functions serve --no-verify-jwt` e chame via `curl`.

---

## Autenticação e Rotas Protegidas

- O middleware do Next.js (`src/middleware.ts`) deve verificar a sessão do Supabase e redirecionar para `/login` se não autenticado.
- Após login OAuth, o callback redireciona para `/dashboard`.
- **Nunca** armazene tokens em `localStorage`; use os cookies gerenciados pelo Supabase.

---

## Design (Tema Escuro)

- Configuração via `next-themes` com detecção automática (`system`) e alternador manual.
- Cores base:
  - Fundo: `#0A0A0A`
  - Superfície: `#1A1A1A`
  - Texto primário: `#E0E0E0`
  - Texto secundário: `#A0A0A0`
- Botões primários: acento em azul (`#3B82F6`), hover levemente mais claro.

---

## Testes (Vitest + React Testing Library)

- Todo hook deve ter teste unitário isolado.
- Componentes devem ter testes de integração (renderização, interações).
- Edge Functions: use `Deno.test` e crie mocks das chamadas ao Supabase.
- **Critério de qualidade:** antes de entregar qualquer mudança, rode `npm run test` (frontend) e confirme que nenhum teste quebrou.

---

## O Que Você Não Deve Fazer

- ❌ Não use `any` no TypeScript – prefira `unknown` ou tipagem adequada.
- ❌ Não coloque lógica de negócio dentro de componentes de UI – mova para hooks.
- ❌ Não ignore erros de requisição – mostre um toast ou feedback visual.
- ❌ Não chame Edge Functions diretamente dentro de `useEffect` sem tratamento de cancelamento.
- ❌ Não versionar variáveis de ambiente – `.env.local` no `.gitignore`.
- ❌ Não desabilite RLS – configure políticas corretamente.

---

## Onde Encontrar o Quê (Mapeamento Rápido)

| Quero... | Arquivo/Pasta |
|---|---|
| Definir rotas do Next.js | `src/app/` |
| Configurar tema escuro | `src/app/providers.tsx`, `tailwind.config.js` |
| Criar um novo custom hook | `src/features/<feature>/hooks/use*.ts` |
| Acessar Supabase no cliente | `src/lib/supabase/client.ts` |
| Acessar Supabase no server (RSC) | `src/lib/supabase/server.ts` |
| Edge Function de resumo mensal | `supabase/functions/monthly-summary/index.ts` |
| Validação de formulários | `src/lib/validations/` (Zod) |
| Testes de hook | `src/features/<feature>/hooks/use*.test.ts` |
| Testes de componente | `src/features/<feature>/components/*.test.tsx` |

---

## Processo de Desenvolvimento Obrigatório

1. Crie um branch a partir de `main` com nome descritivo.
2. Implemente seguindo as convenções acima.
3. Escreva testes que cubram a nova funcionalidade.
4. Atualize o `CHANGELOG.md` na seção `[Unreleased]`.
5. Rode os testes localmente e corrija falhas.
6. Submeta um PR.

---

## Diretrizes Complementares para Agentes de IA

- Nunca modificar arquivos de configuração do Supabase sem justificativa explícita.
- Sempre que criar uma nova Edge Function, documente seu propósito no `README.md`.
- Prefira composição de hooks pequenos a hooks monolíticos.
- Mantenha as importações organizadas: React → bibliotecas externas → módulos internos (`@/`).
- Commits semânticos: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.

---

> Este documento é obrigatório e substitui quaisquer outras convenções não listadas aqui.
