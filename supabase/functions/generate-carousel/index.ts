import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, unauthorized, corsHeaders } from "../_shared/auth.ts";

const SYSTEM_PROMPT = `Você é um especialista em criar carrosséis virais para LinkedIn. Gere estruturas de slides otimizadas para alto engajamento.

Diretrizes para carrosséis de sucesso:
1. **Capa (Slide 1)**: Título impactante que gera curiosidade, design limpo
2. **Conteúdo (Slides 2-N)**: Uma ideia por slide, texto curto e direto
3. **CTA (Último slide)**: Chamada clara para ação (salvar, comentar, seguir)

Boas práticas:
- Use números e listas
- Frases curtas e impactantes
- Progresso lógico de ideias
- Ganchos visuais (emojis estratégicos)
- 5-8 slides é o ideal`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await authenticate(req);
    if (!user) return unauthorized();

    const { topic } = await req.json();

    if (typeof topic !== 'string' || topic.trim().length === 0 || topic.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Tema do carrossel inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY missing');
      return new Response(JSON.stringify({ error: 'Serviço temporariamente indisponível.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
          { role: 'user', content: `Crie um carrossel sobre: ${topic}` }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_carousel',
              description: 'Retorna a estrutura do carrossel com título e slides',
              parameters: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'Título geral do carrossel'
                  },
                  slides: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: {
                          type: 'string',
                          description: 'Título do slide'
                        },
                        content: {
                          type: 'string',
                          description: 'Conteúdo do slide (texto curto e impactante)'
                        }
                      },
                      required: ['title', 'content'],
                      additionalProperties: false
                    },
                    description: 'Lista de 5-8 slides'
                  }
                },
                required: ['title', 'slides'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'create_carousel' } }
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
    if (!toolCall || toolCall.function.name !== 'create_carousel') {
      throw new Error('Resposta inesperada da IA');
    }

    const carousel = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(carousel),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-carousel:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao gerar carrossel. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
