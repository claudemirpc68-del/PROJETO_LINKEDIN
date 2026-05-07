import { PostTemplate } from '@/types';

export const templates: PostTemplate[] = [
  {
    id: 'historia-1',
    category: 'historia-pessoal',
    title: 'História de Superação',
    description: 'Compartilhe um momento difícil e como você o superou',
    icon: '📖',
    structure: `[GANCHO EMOCIONAL - 1 linha impactante]

Há [tempo] atrás, eu estava [situação difícil].

[Detalhe da situação - 2-3 linhas]

O que me salvou foi [aprendizado/mudança].

[Desenvolvimento - como você mudou]

Hoje, olhando para trás, percebo que:

→ [Insight 1]
→ [Insight 2]
→ [Insight 3]

Se você está passando por algo parecido, saiba: [mensagem de esperança].

[CTA - pergunta para engajamento]`,
    example: `"Você não é bom o suficiente."

Há 3 anos, ouvi isso de um gestor. Na frente de toda a equipe.

Naquele momento, tive duas opções: acreditar ou provar o contrário.

Escolhi a segunda.

Hoje lidero um time de 15 pessoas na mesma empresa que quase me fez desistir.

O que aprendi:
→ Feedback diz mais sobre quem fala do que sobre você
→ Resiliência não é ignorar a dor, é seguir apesar dela
→ Seu maior crítico pode ser seu maior combustível

E você, já transformou uma crítica em motivação?`
  },
  {
    id: 'dica-1',
    category: 'dica-pratica',
    title: 'Dica Prática em Lista',
    description: 'Compartilhe conhecimento de forma direta e aplicável',
    icon: '💡',
    structure: `[PROMESSA CLARA - O que a pessoa vai aprender]

Depois de [experiência/tempo], descobri [X] coisas que [resultado].

Aqui está o que funciona:

1️⃣ [Dica 1]
↳ [Explicação breve]

2️⃣ [Dica 2]
↳ [Explicação breve]

3️⃣ [Dica 3]
↳ [Explicação breve]

4️⃣ [Dica 4]
↳ [Explicação breve]

5️⃣ [Dica 5]
↳ [Explicação breve]

💡 Dica bônus: [Insight extra]

[CTA - Qual dessas você vai aplicar primeiro?]`,
    example: `5 formas de aumentar sua produtividade sem trabalhar mais horas:

Depois de 10 anos testando métodos, descobri o que realmente funciona.

1️⃣ Regra dos 2 minutos
↳ Se leva menos de 2 min, faça agora

2️⃣ Time blocking
↳ Agende tarefas como reuniões

3️⃣ Técnica 1-3-5
↳ 1 tarefa grande, 3 médias, 5 pequenas por dia

4️⃣ Email em horários fixos
↳ Checar só 3x ao dia muda tudo

5️⃣ Descanso estratégico
↳ Pausas de 5 min a cada 25 de foco

💡 Bônus: Diga não para 50% dos pedidos

Qual você vai testar amanhã?`
  },
  {
    id: 'case-1',
    category: 'case-sucesso',
    title: 'Case de Resultados',
    description: 'Mostre resultados concretos de um projeto ou iniciativa',
    icon: '📊',
    structure: `[RESULTADO IMPACTANTE EM NÚMEROS]

[Contexto - qual era o problema/desafio]

O cenário inicial:
• [Métrica ruim 1]
• [Métrica ruim 2]
• [Problema principal]

O que fizemos diferente:

1. [Ação 1]
2. [Ação 2]
3. [Ação 3]

Os resultados:
📈 [Métrica de sucesso 1]
📈 [Métrica de sucesso 2]
📈 [Métrica de sucesso 3]

O maior aprendizado: [Insight principal]

[CTA - Quer saber mais sobre alguma etapa?]`,
    example: `De 2% para 18% de conversão em 90 dias.

Nosso e-commerce estava patinando. Tráfego alto, vendas baixas.

O cenário inicial:
• Taxa de abandono de carrinho: 78%
• Tempo médio no site: 45s
• NPS do checkout: 32

O que fizemos diferente:

1. Reduzimos o checkout de 5 para 2 etapas
2. Adicionamos prova social em tempo real
3. Implementamos recuperação de carrinho com WhatsApp

Os resultados:
📈 Conversão: 2% → 18%
📈 Ticket médio: +34%
📈 Recompra em 30 dias: 3x maior

O maior aprendizado: Simplicidade vende mais que desconto.

Quer detalhes sobre alguma dessas mudanças?`
  },
  {
    id: 'ia-1',
    category: 'ia-tecnologia',
    title: 'IA na Prática',
    description: 'Mostre aplicações reais de IA no dia a dia profissional',
    icon: '🤖',
    structure: `[GANCHO - Como IA mudou algo específico]

[Introdução - contexto do uso]

Antes da IA:
⏰ [Tempo/esforço gasto]
📝 [Processo manual]

Depois:
⚡ [Novo tempo/eficiência]
🎯 [Resultado melhor]

A ferramenta que uso: [Nome da ferramenta]

Como configurei:
→ [Passo 1]
→ [Passo 2]
→ [Passo 3]

⚠️ Cuidado com: [Limitação/erro comum]

[CTA - Pergunta sobre uso de IA]`,
    example: `ChatGPT me economiza 10h por semana. Sério.

Trabalho com conteúdo e pesquisa era meu gargalo.

Antes da IA:
⏰ 4h pesquisando tendências
📝 2h estruturando briefings
😫 Burnout criativo constante

Depois:
⚡ 30 min com prompts bem construídos
🎯 Qualidade 2x melhor (validado por métricas)

O que uso:
→ Pesquisa: ChatGPT + Claude para análise
→ Estrutura: Templates com prompts personalizados
→ Revisão: Sempre humana no final

⚠️ Cuidado: IA é assistente, não substituto. Sempre revise e adicione sua voz.

Como você está usando IA no seu trabalho?`
  },
  {
    id: 'esg-1',
    category: 'esg-cultura',
    title: 'Cultura & Valores',
    description: 'Compartilhe práticas de cultura organizacional e ESG',
    icon: '🌱',
    structure: `[DECLARAÇÃO DE VALOR/PRINCÍPIO]

Na [empresa/equipe], acreditamos que [valor].

Isso significa que:

✅ [Prática concreta 1]
✅ [Prática concreta 2]
✅ [Prática concreta 3]

O resultado?
[Impacto positivo mensurável]

Nem sempre é fácil. [Desafio real]

Mas vale a pena porque [razão genuína].

[Reflexão/CTA sobre valores]`,
    example: `"Flexibilidade não é benefício. É respeito."

Na nossa empresa, acreditamos que adultos sabem gerenciar seu tempo.

Isso significa que:

✅ Sem horário fixo de entrada/saída
✅ Home office quando fizer sentido
✅ Resultados > horas logadas

O resultado?
• Turnover caiu 60% em 2 anos
• Produtividade aumentou 23%
• eNPS subiu de 45 para 82

Nem sempre é fácil. Exige confiança real e comunicação constante.

Mas vale a pena porque talentos ficam onde são tratados como adultos.

Como é a cultura de flexibilidade onde você trabalha?`
  },
  {
    id: 'tendencias-1',
    category: 'tendencias',
    title: 'Análise de Tendência',
    description: 'Compartilhe sua visão sobre tendências do mercado',
    icon: '📈',
    structure: `[PREVISÃO/OBSERVAÇÃO IMPACTANTE]

Estou observando algo que poucos estão falando:
[Tendência]

Os sinais:
🔍 [Dado/evidência 1]
🔍 [Dado/evidência 2]
🔍 [Dado/evidência 3]

O que isso significa para [profissão/setor]:

Para quem ignorar:
❌ [Consequência negativa]

Para quem se adaptar:
✅ [Oportunidade]

Minha aposta: [Sua visão do futuro]

Prazo: [Quando você acha que isso vai acontecer]

[CTA - Concorda/discorda?]`,
    example: `Em 2025, 50% dos profissionais de marketing não vão saber usar IA.

E vão ficar para trás.

Os sinais que estou vendo:
🔍 Vagas já pedem "experiência com IA generativa"
🔍 Agencies demitindo e recontratando com skill de IA
🔍 Produtividade de quem usa: 3x maior

O que isso significa para marketeiros:

Para quem ignorar:
❌ Vai competir por vagas cada vez mais escassas

Para quem se adaptar:
✅ Vai liderar a próxima onda de eficiência

Minha aposta: Em 18 meses, IA será tão básico quanto Excel.

O momento de aprender é agora, não quando for obrigatório.

Concorda ou estou exagerando?`
  }
];

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'historia-pessoal': 'História Pessoal',
    'dica-pratica': 'Dica Prática',
    'case-sucesso': 'Case de Sucesso',
    'ia-tecnologia': 'IA & Tecnologia',
    'esg-cultura': 'ESG & Cultura',
    'tendencias': 'Tendências'
  };
  return labels[category] || category;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'historia-pessoal': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'dica-pratica': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'case-sucesso': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'ia-tecnologia': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    'esg-cultura': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'tendencias': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};
