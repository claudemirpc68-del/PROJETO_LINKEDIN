import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, unauthorized, corsHeaders } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await authenticate(req);
    if (!user) return unauthorized();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY missing");
      return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { topic, tone, language } = await req.json();

    if (typeof topic !== 'string' || topic.trim().length === 0 || topic.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Topic inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toneInstruction = tone === "formal" 
      ? "Use um tom profissional e formal."
      : tone === "casual"
      ? "Use um tom casual e descontraído, mas ainda profissional."
      : tone === "inspirational"
      ? "Use um tom inspirador e motivacional."
      : tone === "educational"
      ? "Use um tom educativo e informativo."
      : "Use um tom profissional e engajador.";

    const systemPrompt = `Você é um especialista em marketing de conteúdo para LinkedIn. Sua tarefa é criar posts virais e engajadores.

Regras:
- Escreva em ${language === "en" ? "inglês" : "português brasileiro"}
- ${toneInstruction}
- Comece com um hook poderoso (primeira linha que prende a atenção)
- Use parágrafos curtos (1-2 linhas)
- Inclua quebras de linha para facilitar a leitura
- Adicione 3-5 hashtags relevantes no final
- Inclua um CTA (call to action) antes das hashtags
- O post deve ter entre 150-300 palavras
- NÃO use emojis em excesso (máximo 3-4 no post inteiro)
- NÃO inclua links externos
- Formate para máximo engajamento no feed do LinkedIn`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Crie um post para LinkedIn sobre o seguinte tema: ${topic}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate caption");
    }

    const data = await response.json();
    const caption = data.choices?.[0]?.message?.content;

    if (!caption) {
      throw new Error("No caption generated");
    }

    return new Response(
      JSON.stringify({ caption }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-linkedin-caption:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao gerar legenda. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
