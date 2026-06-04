# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [Unreleased]

### Added
- Scaffold completo do projeto Next.js 16 com App Router + TypeScript.
- Configuração PWA via `next-pwa` com Service Worker e manifesto (`manifest.json`).
- Tema escuro automático (`next-themes`) com variáveis CSS customizadas.
- Autenticação OAuth via GitHub e Google (Supabase Auth).
- Middleware de proteção de rotas — redireciona para `/login` se não autenticado.
- Callback OAuth em `/auth/callback` com troca de código de sessão.
- Feature `cards`: listagem, criação, edição e remoção de cartões com cores.
- Feature `income`: registro de rendas mensais por fonte com total acumulado.
- Feature `expenses`: registro de gastos com Pix, Débito e Crédito parcelado (apenas crédito); criação automática de parcelas subsequentes.
- Feature `debts`: lembretes de pessoas a pagar / me devendo, com liquidação.
- Feature `dashboard`: cards de resumo (entradas, saídas, saldo mensal, saldo acumulado), gráfico de pizza por categoria e gráfico de barras entradas vs saídas.
- Navegação bottom-nav no mobile e sidebar colapsável no desktop.
- Design mobile-first com breakpoints Tailwind (`sm:`, `md:`, `lg:`).
- Componentes UI base: `Button`, `Card`, `Input`, `Label`, `Dialog`, `Select`, `Badge`, `Separator`, `Tabs`, `Skeleton`.
- Migrations SQL: schema inicial (categorias, cartões, rendas, transações, lembretes) com RLS.
- Trigger SQL: categorias padrão inseridas automaticamente ao criar usuário.
- Edge Function `monthly-summary` em Deno para resumo mensal agregado.
- Validações Zod: `cardSchema`, `incomeSchema`, `expenseSchema`, `debtSchema`.
- Custom hooks com injeção de dependência para testabilidade.
- Testes unitários com Vitest + React Testing Library para `useCards`, `useIncome`, `useExpenses`, `useDebts`, `useDashboard`.
- Página offline (`/offline`) para PWA sem conexão.
- Variáveis de ambiente documentadas em `.env.local.example`.
