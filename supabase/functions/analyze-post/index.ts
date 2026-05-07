import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, unauthorized, corsHeaders } from "../_shared/auth.ts";

const SYSTEM_PROMPT = `Você é um especialista em LinkedIn e marketing de conteúdo. Analise o post fornecido e avalie sua eficácia para viralização no LinkedIn.

Critérios de avaliação:
1. **Hook/Gancho (hookStrength)**: A primeira linha captura atenção? Gera curiosidade?
2. **Autenticidade (authenticity)**: O tom é genuíno? Evita autopromoção excessiva?
3. **Estrutura (structure)**: Usa formatação adequada? Parágrafos curtos? Listas? Espaçamento?
4. **Call-to-Action (cta)**: Termina com engajamento? Pergunta? Convite à ação?

Penalidades:
- Links externos no corpo do post (reduzem alcance)
- Autopromoção excessiva
- Parágrafos muito longos
- Falta de quebras visuais
- Uso excessivo de hashtags

Bonificações:
- Storytelling pessoal
- Dados e números concretos
- Perguntas que geram comentários
- Formatação escaneável
- Temas em alta: IA, diversidade, personal branding`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await authenticate(req);
    if (!user) return unauthorized();

    const { content } = await req.json();

    if (typeof content !== 'string' || content.trim().length === 0 || content.length > 10000) {
      return new Response(
        JSON.stringify({ error: 'Conteúdo do post inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analise este post do LinkedIn:\n\n${content}` }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_post',
              description: 'Retorna a análise estruturada do post do LinkedIn',
              parameters: {
                type: 'object',
                properties: {
                  score: {
                    type: 'number',
                    description: 'Score geral de viralidade (0-100)'
                  },
                  hookStrength: {
                    type: 'number',
                    description: 'Força do gancho/primeira linha (0-100)'
                  },
                  authenticity: {
                    type: 'number',
                    description: 'Nível de autenticidade e genuinidade (0-100)'
                  },
                  structure: {
                    type: 'number',
                    description: 'Qualidade da estrutura e formatação (0-100)'
                  },
                  cta: {
                    type: 'number',
                    description: 'Eficácia do call-to-action (0-100)'
                  },
                  suggestions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Lista de sugestões de melhoria (3-5 itens)'
                  },
                  warnings: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Lista de alertas/problemas identificados'
                  }
                },
                required: ['score', 'hookStrength', 'authenticity', 'structure', 'cta', 'suggestions', 'warnings'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_post' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Erro ao chamar AI Gateway');
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'analyze_post') {
      throw new Error('Resposta inesperada da IA');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-post:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao processar análise. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
