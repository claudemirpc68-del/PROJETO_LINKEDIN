# README do Projeto: LinkedIn Viral

Este projeto é uma plataforma completa para criação, análise e agendamento de conteúdo viral para o LinkedIn, utilizando Inteligência Artificial de ponta e uma interface premium.

## 🚀 Tecnologias Utilizadas

O projeto foi construído com uma stack moderna e escalável:

- **Frontend**: React 18 + Vite 5
- **Linguagem**: TypeScript 5
- **Estilização**: Tailwind CSS v3 + shadcn/ui (componentes de alta qualidade)
- **Animações**: Framer Motion
- **Backend**: Supabase (Autenticação, Database, Storage e Edge Functions)
- **IA**: Gemini 3 Flash e Gemini 1.5 Flash (via Lovable AI Gateway)
- **Busca**: Tavily API para contexto em tempo real

## 📋 Funcionalidades Principais

1.  **💬 Chat com IA**: Geração de posts otimizados para o LinkedIn com streaming em tempo real.
2.  **📊 Análise de Posts**: Avaliação de potencial viral (score 0-100) com feedback sobre gancho, estrutura e CTA.
3.  **🎠 Gerador de Carrossel**: Criação automática de estruturas de slides para carrosséis do LinkedIn.
4.  **📅 Calendário Editorial**: Gestão visual de posts agendados e histórico de publicações.
5.  **🖼️ Galeria de Imagens**: Geração de imagens via IA em diversos estilos (Corporativo, Minimalista, etc.) e armazenamento seguro.
6.  **📝 Templates Estratégicos**: Biblioteca de modelos validados para diferentes objetivos (Dicas, Cases, Tendências).
7.  **🔐 Autenticação Completa**: Sistema de login seguro com persistência de dados por usuário.
8.  **🌐 Landing Page Premium**: Interface de apresentação com animações e prova social.

## 🛠️ Como Iniciar o Projeto

### Pré-requisitos
- Node.js instalado
- Conta no Supabase (para as variáveis de ambiente)

### Passo a Passo

1.  **Instalação de Dependências**:
    ```bash
    npm install
    ```

2.  **Configuração de Variáveis de Ambiente**:
    Crie um arquivo `.env` na raiz com as chaves do seu projeto Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anon_key
    ```

3.  **Execução em Desenvolvimento**:
    ```bash
    npm run dev
    ```

## 📂 Estrutura de Arquivos Principal

- `src/components/`: Componentes reutilizáveis da interface.
- `src/pages/`: Telas principais do aplicativo (Chat, Dashboard, Calendar, etc.).
- `src/hooks/`: Hooks customizados para lógica de estado e integração com Supabase.
- `src/lib/`: Configurações de bibliotecas (Supabase client, utils).
- `supabase/functions/`: Edge Functions para processamento de IA e integrações.

---
## 📚 Atualização de Schema de Banco de Dados

A tabela **`calendar_posts`** agora possui a coluna **`scheduled_at`** (tipo `timestamptz`).
- Quando um post está no status `rascunho` ou não possui data de agendamento, o campo **`scheduled_at`** é salvo como **`null`**.
- Para posts agendados, a data é armazenada em UTC e convertida para ISO string ao ser enviada ao Supabase.

Essa lógica foi implementada no hook **`useCalendarPosts`**, na função `toDb`, que define:

```ts
date: post.status === 'rascunho' || !post.scheduledDate
        ? null
        : new Date(post.scheduledDate).toISOString(),
```

Isso evita erros de `Invalid Date` no calendário e garante que o **auto‑publisher** execute apenas posts com data válida.

---
Este projeto foi desenvolvido originalmente via Lovable e customizado para oferecer a melhor experiência em criação de conteúdo profissional.
