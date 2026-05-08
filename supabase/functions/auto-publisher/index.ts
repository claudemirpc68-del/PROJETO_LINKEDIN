import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Buscar posts agendados que já passaram do horário
    const now = new Date().toISOString();
    console.log(`Checking for posts to publish before ${now}...`);

    const { data: posts, error: fetchError } = await supabaseClient
      .from('calendar_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now);

    if (fetchError) throw fetchError;

    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ message: "No posts to publish at this time" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Found ${posts.length} posts to publish.`);
    const results = [];

    // 2. Processar cada post
    for (const post of posts) {
      try {
        console.log(`Publishing post: ${post.title}`);

        // Aqui vai a lógica de chamada da API do LinkedIn
        // Simulando a publicação com sucesso
        
        // 3. Atualizar o status do post para 'published'
        const { error: updateError } = await supabaseClient
          .from('calendar_posts')
          .update({ status: 'published' })
          .eq('id', post.id);

        if (updateError) throw updateError;

        // 4. CRIAR NOTIFICAÇÃO PARA O USUÁRIO
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: post.user_id,
            title: 'Post Publicado! 🚀',
            message: `O seu post "${post.title}" foi publicado com sucesso no LinkedIn.`,
            type: 'success'
          });

        results.push({ id: post.id, status: 'success' });
      } catch (postError) {
        console.error(`Error publishing post ${post.id}:`, postError);
        
        // Notificação de erro
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: post.user_id,
            title: 'Erro na Publicação ❌',
            message: `Não foi possível publicar o post "${post.title}". Verifique suas credenciais.`,
            type: 'error'
          });

        results.push({ id: post.id, status: 'error', error: postError.message });
      }
    }

    return new Response(JSON.stringify({ message: "Process complete", results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Fatal error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
