import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, unauthorized, corsHeaders } from "../_shared/auth.ts";

interface LinkedInPostRequest {
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await authenticate(req);
    if (!user) return unauthorized();

    const LINKEDIN_ACCESS_TOKEN = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
    if (!LINKEDIN_ACCESS_TOKEN) {
      console.error("LINKEDIN_ACCESS_TOKEN missing");
      return new Response(JSON.stringify({ error: "Serviço de publicação indisponível." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content }: LinkedInPostRequest = await req.json();

    if (typeof content !== 'string' || content.trim().length === 0 || content.length > 3000) {
      return new Response(
        JSON.stringify({ error: "Conteúdo inválido (1-3000 caracteres)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching LinkedIn user profile...");

    // First, get the user's LinkedIn ID (person URN)
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        "Authorization": `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("LinkedIn profile error:", profileResponse.status, errorText);
      
      if (profileResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: "Token de acesso do LinkedIn inválido ou expirado. Por favor, gere um novo token." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Failed to get LinkedIn profile: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();
    const personUrn = `urn:li:person:${profile.sub}`;
    
    console.log("LinkedIn user URN:", personUrn);
    console.log("Creating LinkedIn post...");

    // Create the post using the Posts API
    const postResponse = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202401",
      },
      body: JSON.stringify({
        author: personUrn,
        commentary: content.trim(),
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      console.error("LinkedIn post error:", postResponse.status, errorText);
      
      if (postResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: "Token de acesso do LinkedIn inválido ou expirado." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (postResponse.status === 403) {
        return new Response(
          JSON.stringify({ error: "Sem permissão para postar. Verifique se o token tem a permissão 'w_member_social'." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Failed to create LinkedIn post: ${postResponse.status} - ${errorText}`);
    }

    // Get the post ID from the response header
    const postId = postResponse.headers.get("x-restli-id") || "unknown";
    
    console.log("LinkedIn post created successfully. Post ID:", postId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Post publicado no LinkedIn com sucesso!",
        postId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in publish-linkedin:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao publicar no LinkedIn. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
