import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, unauthorized, corsHeaders } from "../_shared/auth.ts";

const SYSTEM_PROMPT = `Você é um especialista em criar posts virais para o LinkedIn. Você deve:

1. ENTENDER O PEDIDO do usuário e gerar conteúdo relevante
2. Manter uma conversa natural e útil
3. Quando o usuário pedir para criar um post, siga as melhores práticas abaixo

ESTRUTURA DO POST (quando solicitado):
1. GANCHO (primeira linha): Uma frase impactante que prende a atenção. Use quebra de padrão, provocação ou promessa de valor.
2. HISTÓRIA/CONTEXTO: Desenvolva com storytelling pessoal e autêntico.
3. INSIGHTS/LIÇÕES: Apresente 3-5 pontos práticos e acionáveis.
4. CTA (Call to Action): Finalize com uma pergunta ou convite ao engajamento.

REGRAS DE OURO PARA POSTS:
- Priorize conteúdo nativo (sem links externos no post principal)
- Use parágrafos curtos (1-2 linhas)
- Inclua espaçamento entre parágrafos para facilitar leitura
- Seja autêntico, evite autopromoção excessiva
- Foque em temas relevantes: IA, produtividade, carreira, liderança, ESG
- Use emojis com moderação (máximo 3-4 por post)
- Tamanho ideal: 1200-1500 caracteres

FORMATOS QUE VIRALIZAM:
- Lista de aprendizados
- Antes vs Depois
- Mito vs Realidade
- História de fracasso que virou sucesso
- Bastidores de uma decisão difícil

SUAS RESPOSTAS:
- Quando for uma conversa normal, responda de forma natural e útil
- Quando for pedido de post, forneça o post formatado e otimizado
- Se o usuário pedir ajustes, faça as modificações solicitadas
- Seja amigável e proativo em oferecer sugestões`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await authenticate(req);
    if (!user) return unauthorized();

    const { message, messages: history, webhookUrl, conversationId } = await req.json();

    if (typeof message !== 'string' || message.trim().length === 0 || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Mensagem inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (history && (!Array.isArray(history) || history.length > 100)) {
      return new Response(JSON.stringify({ error: "Histórico inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (webhookUrl) {
      try { new URL(webhookUrl); } catch {
        return new Response(JSON.stringify({ error: "URL de webhook inválida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY missing");
      return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating response for message:", message);
    console.log("Conversation history length:", history?.length || 0);

    // Detect if user wants research/trends and enrich with Tavily
    const researchKeywords = ['pesquis', 'tendência', 'tendencia', 'trend', 'dados reais', 'notícia', 'noticia', 'atualidade', 'recente', '🔍'];
    const needsResearch = researchKeywords.some(k => message.toLowerCase().includes(k));
    
    let tavilyContext = '';
    if (needsResearch) {
      try {
        const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
        if (TAVILY_API_KEY) {
          // Extract core topic from message
          const searchQuery = `LinkedIn trending topics ${message.replace(/🔍|pesquis\w*|tendência\w*|dados reais/gi, '').trim()} 2025`;
          console.log('Tavily search query:', searchQuery);
          
          const tavilyResp = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              api_key: TAVILY_API_KEY,
              query: searchQuery,
              topic: 'general',
              max_results: 5,
              include_answer: true,
              search_depth: 'advanced',
            }),
          });

          if (tavilyResp.ok) {
            const tavilyData = await tavilyResp.json();
            const sources = (tavilyData.results || [])
              .slice(0, 5)
              .map((r: any) => `- **${r.title}**: ${r.content?.slice(0, 200)}`)
              .join('\n');
            
            tavilyContext = `\n\n--- DADOS DE PESQUISA REAL (Tavily) ---\n` +
              (tavilyData.answer ? `Resumo: ${tavilyData.answer}\n\n` : '') +
              `Fontes:\n${sources}\n--- FIM DOS DADOS ---\n\n` +
              `Use estes dados reais para enriquecer o post com informações atuais e concretas. Cite estatísticas e tendências encontradas.`;
          }
        }
      } catch (err) {
        console.error('Tavily enrichment failed (non-blocking):', err);
      }
    }

    // Trigger webhook if provided (fire and forget)
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          timestamp: new Date().toISOString(),
          conversationId,
          source: "linkedin-post-generator",
        }),
      }).catch(err => console.error("Webhook error:", err));
    }

    // Build messages array with history
    const aiMessages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history if available
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        aiMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current user message (enriched with Tavily data if available)
    const enrichedMessage = tavilyContext 
      ? `${message}\n${tavilyContext}`
      : message;
    aiMessages.push({ role: "user", content: enrichedMessage });

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in generate-post:", error);
    return new Response(JSON.stringify({ error: "Erro ao processar solicitação. Tente novamente." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
