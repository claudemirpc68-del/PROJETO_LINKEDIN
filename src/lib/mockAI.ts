import { PostAnalysis } from '@/types';

// Simulated AI responses for the chatbot
const linkedinTips = [
  "Lembre-se: o algoritmo do LinkedIn prioriza conteúdos nativos. Evite links externos no post principal.",
  "Histórias pessoais geram 3x mais engajamento que posts promocionais.",
  "Use quebras de linha e emojis estratégicos para melhorar a escaneabilidade.",
  "Os primeiros 2-3 segundos são cruciais. Seu gancho precisa parar o scroll.",
  "Vídeos curtos (1-3 min) têm o maior alcance atualmente.",
  "Conteúdos sobre IA, produtividade e carreira estão em alta.",
  "Autenticidade vende mais que perfeição. Mostre os bastidores.",
  "Termine sempre com uma pergunta para incentivar comentários."
];

export const generateMockResponse = async (userMessage: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
  
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for specific topics
  if (lowerMessage.includes('carrossel') || lowerMessage.includes('carousel')) {
    return `📱 **Ótima escolha! Carrosséis têm alto engajamento no LinkedIn.**

Aqui está uma estrutura que funciona:

**Slide 1 - Capa (Gancho)**
→ Título impactante com promessa clara
→ Design limpo, fonte grande

**Slides 2-8 - Conteúdo**
→ Uma ideia por slide
→ Texto curto e direto
→ Use números e ícones

**Slide 9 - CTA**
→ Resumo dos pontos
→ Chamada para ação (salvar, comentar, seguir)

💡 **Dica**: Use a aba "Carrossel" para gerar a estrutura automaticamente!

Qual é o tema do seu carrossel?`;
  }
  
  if (lowerMessage.includes('ia') || lowerMessage.includes('inteligência artificial') || lowerMessage.includes('chatgpt')) {
    return `🤖 **Posts sobre IA estão bombando no LinkedIn!**

Aqui está um framework que funciona:

**Estrutura recomendada:**

1. **Gancho controverso ou surpreendente**
   Ex: "ChatGPT me economiza 10h/semana"

2. **Contexto do problema**
   O que você fazia antes vs. agora

3. **Passo a passo prático**
   Mostre exatamente como você usa

4. **Resultados mensuráveis**
   Tempo economizado, qualidade, etc.

5. **Ressalva importante**
   "IA é assistente, não substituto"

6. **CTA**
   "Como você está usando IA?"

**⚠️ Evite:** Parecer que IA faz tudo sozinha. Mostre seu toque humano.

Quer que eu gere um rascunho sobre alguma aplicação específica de IA?`;
  }
  
  if (lowerMessage.includes('engajamento') || lowerMessage.includes('viral') || lowerMessage.includes('alcance')) {
    return `📈 **Para aumentar o engajamento no LinkedIn:**

**O que funciona em 2024:**

✅ **Formato nativo** - Sem links externos no post
✅ **Primeiras 3 linhas matadoras** - O "gancho" é tudo
✅ **Storytelling pessoal** - Vulnerabilidade conecta
✅ **Números e dados** - Trazem credibilidade
✅ **Formatação escaneável** - Listas, emojis, quebras
✅ **CTA no final** - Perguntas geram comentários

**O que prejudica:**

❌ Autopromoção excessiva
❌ Links no corpo do post
❌ Textos em blocos longos
❌ Tom muito formal/corporativo
❌ Hashtags em excesso (3-5 é ideal)

**Horários de ouro:**
🕐 Terça a quinta, 8h-10h ou 17h-19h

Qual aspecto você quer trabalhar primeiro?`;
  }
  
  if (lowerMessage.includes('história') || lowerMessage.includes('pessoal') || lowerMessage.includes('storytelling')) {
    return `📖 **Storytelling pessoal é o formato mais poderoso do LinkedIn!**

**Estrutura que viraliza:**

1. **Gancho emocional** (1 linha)
   → Frase curta, impactante, que gera curiosidade
   → Ex: "Fui demitido 3 vezes em 2 anos."

2. **Contexto** (2-3 linhas)
   → Situe o leitor no tempo e situação
   → Seja específico, não genérico

3. **O conflito** (3-4 linhas)
   → Qual foi o desafio/problema?
   → Mostre vulnerabilidade real

4. **A virada** (3-4 linhas)
   → O que você aprendeu/mudou?
   → Insight genuíno, não clichê

5. **Lições** (lista com →)
   → 3 aprendizados práticos
   → Aplicáveis para o leitor

6. **CTA** (1 linha)
   → Pergunta que convida resposta

**💡 Dica:** Histórias de fracasso > histórias de sucesso

Quer que eu ajude a estruturar alguma história sua?`;
  }
  
  // Default response
  const randomTip = linkedinTips[Math.floor(Math.random() * linkedinTips.length)];
  
  return `Ótimo tema para um post! 

Vou te ajudar a criar algo que gere engajamento no LinkedIn.

**Sobre o que você mencionou**, aqui estão algumas abordagens:

1. **Formato de lista** - Organize as ideias em pontos numerados
2. **Storytelling** - Comece com uma experiência pessoal relacionada
3. **Dados + opinião** - Traga números e seu ponto de vista

**💡 Dica rápida:** ${randomTip}

Qual abordagem você prefere? Ou quer que eu gere um rascunho direto?`;
};

export const analyzePost = async (content: string): Promise<PostAnalysis> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const lines = content.split('\n').filter(l => l.trim());
  const wordCount = content.split(/\s+/).length;
  const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/u.test(content);
  const hasQuestion = content.includes('?');
  const hasNumbers = /\d/.test(content);
  const hasLink = /https?:\/\//.test(content);
  const hasBulletPoints = /^[\s]*[•→\-\d\.]/m.test(content);
  
  // Calculate scores
  let hookStrength = 50;
  if (lines[0]?.length < 60) hookStrength += 15;
  if (lines[0]?.length < 40) hookStrength += 10;
  if (/[!?"]/.test(lines[0] || '')) hookStrength += 10;
  if (/^\d|^"/.test(lines[0] || '')) hookStrength += 15;
  
  let authenticity = 60;
  if (content.toLowerCase().includes('eu ') || content.toLowerCase().includes('minha')) authenticity += 15;
  if (content.toLowerCase().includes('aprendi') || content.toLowerCase().includes('descobri')) authenticity += 10;
  if (!content.toLowerCase().includes('compre') && !content.toLowerCase().includes('inscreva')) authenticity += 15;
  
  let structure = 50;
  if (lines.length >= 5) structure += 10;
  if (hasBulletPoints) structure += 15;
  if (hasEmoji) structure += 10;
  if (wordCount >= 100 && wordCount <= 300) structure += 15;
  
  let cta = 30;
  if (hasQuestion) cta += 40;
  if (content.toLowerCase().includes('comente') || content.toLowerCase().includes('compartilhe')) cta += 20;
  if (lines[lines.length - 1]?.includes('?')) cta += 10;
  
  const suggestions: string[] = [];
  const warnings: string[] = [];
  
  if (!hasEmoji) suggestions.push('Adicione 2-3 emojis estratégicos para melhorar a escaneabilidade');
  if (!hasQuestion) suggestions.push('Termine com uma pergunta para incentivar comentários');
  if (!hasBulletPoints && wordCount > 100) suggestions.push('Use listas com → ou • para facilitar a leitura');
  if (lines[0]?.length > 60) suggestions.push('Encurte o gancho inicial para menos de 60 caracteres');
  if (wordCount < 80) suggestions.push('Expanda o conteúdo - posts entre 100-300 palavras performam melhor');
  if (wordCount > 350) suggestions.push('Considere encurtar - posts muito longos têm menos alcance');
  if (!hasNumbers) suggestions.push('Adicione números ou dados para aumentar credibilidade');
  
  if (hasLink) warnings.push('⚠️ Links externos reduzem o alcance. Considere colocar nos comentários.');
  if (content.toLowerCase().includes('compre') || content.toLowerCase().includes('adquira')) {
    warnings.push('⚠️ Tom promocional pode gerar rejeição. Foque em valor primeiro.');
  }
  if (content.split('#').length > 6) warnings.push('⚠️ Muitas hashtags. Use no máximo 3-5.');
  
  const score = Math.min(100, Math.round((hookStrength + authenticity + structure + cta) / 4));
  
  return {
    score,
    hookStrength: Math.min(100, hookStrength),
    authenticity: Math.min(100, authenticity),
    structure: Math.min(100, structure),
    cta: Math.min(100, cta),
    suggestions: suggestions.slice(0, 5),
    warnings
  };
};

export const generateCarouselFromTopic = async (topic: string): Promise<{ title: string; slides: { title: string; content: string }[] }> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return {
    title: `${topic.charAt(0).toUpperCase() + topic.slice(1)}: O Guia Completo`,
    slides: [
      {
        title: 'CAPA',
        content: `${topic.charAt(0).toUpperCase() + topic.slice(1)}:\n${Math.floor(Math.random() * 5) + 5} coisas que ninguém te conta\n\n[Seu nome]\n[Sua posição]`
      },
      {
        title: 'Introdução',
        content: `Depois de [X anos/meses] trabalhando com ${topic}, descobri o que realmente funciona.\n\nVou compartilhar os principais insights →`
      },
      {
        title: 'Ponto #1',
        content: `[Primeiro insight ou dica sobre ${topic}]\n\n💡 Por que isso importa:\n[Explicação breve]`
      },
      {
        title: 'Ponto #2',
        content: `[Segundo insight ou dica sobre ${topic}]\n\n💡 Na prática:\n[Exemplo ou aplicação]`
      },
      {
        title: 'Ponto #3',
        content: `[Terceiro insight ou dica sobre ${topic}]\n\n💡 Erro comum:\n[O que evitar]`
      },
      {
        title: 'Ponto #4',
        content: `[Quarto insight ou dica sobre ${topic}]\n\n💡 Dica bônus:\n[Insight adicional]`
      },
      {
        title: 'Resumo',
        content: `Recapitulando:\n\n1. [Ponto 1]\n2. [Ponto 2]\n3. [Ponto 3]\n4. [Ponto 4]`
      },
      {
        title: 'CTA',
        content: `Gostou do conteúdo?\n\n✅ Salve para consultar depois\n💬 Comente qual ponto mais te surpreendeu\n🔔 Siga para mais dicas sobre ${topic}`
      }
    ]
  };
};
