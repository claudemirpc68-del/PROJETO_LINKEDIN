import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, unauthorized, corsHeaders } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await authenticate(req);
    if (!user) return unauthorized();

    const { query, topic = 'general', max_results = 5 } = await req.json();

    if (typeof query !== 'string' || query.trim().length === 0 || query.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Query inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const safeMax = Math.min(Math.max(parseInt(String(max_results)) || 5, 1), 10);

    const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
    if (!TAVILY_API_KEY) {
      console.error('TAVILY_API_KEY missing');
      return new Response(JSON.stringify({ error: 'Serviço temporariamente indisponível.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        topic,
        max_results: safeMax,
        include_answer: true,
        search_depth: 'advanced',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavily API error:', response.status, errorText);
      throw new Error('Erro ao buscar dados do Tavily');
    }

    const data = await response.json();

    // Format results for easy consumption
    const results = {
      answer: data.answer || null,
      results: (data.results || []).map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
      query: data.query,
    };

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in tavily-search:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar resultados. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
