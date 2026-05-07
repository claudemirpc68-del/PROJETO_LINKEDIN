import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, unauthorized, corsHeaders } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await authenticate(req);
    if (!user) return unauthorized();

    const { prompt, postContent, style = 'corporativo' } = await req.json();

    if (prompt && (typeof prompt !== 'string' || prompt.length > 5000)) {
      return new Response(JSON.stringify({ error: "Prompt inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (postContent && (typeof postContent !== 'string' || postContent.length > 10000)) {
      return new Response(JSON.stringify({ error: "Conteúdo inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY missing");
      return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating image for prompt:", prompt || "based on post content", "Style:", style);

    // Style descriptions for different image styles
    const styleDescriptions: Record<string, string> = {
      minimalista: `Clean minimalist design with lots of white space, simple geometric shapes, monochromatic or limited color palette (2-3 colors max), thin lines, subtle shadows, elegant and sophisticated feel, Scandinavian design influence.`,
      corporativo: `Professional corporate style with a polished business aesthetic, blue and neutral tones, subtle gradients, clean typography-inspired elements, conveys trust and reliability, suitable for business and LinkedIn.`,
      colorido: `Vibrant and bold colors, dynamic compositions, gradients and color blends, energetic and creative feel, modern and eye-catching, playful yet professional, uses complementary color combinations.`,
      tecnologia: `Futuristic tech aesthetic with digital elements, circuit patterns, neon accents on dark backgrounds, glowing effects, cyber/tech vibes, abstract data visualizations, modern and innovative feel.`,
      natureza: `Organic and natural elements, earth tones with greens and browns, soft lighting, textures inspired by nature, sustainable and eco-friendly feel, calming and harmonious composition.`,
    };

    const styleGuide = styleDescriptions[style] || styleDescriptions.corporativo;

    // Create an image prompt based on the post content if no specific prompt is provided
    const imagePrompt = prompt || `Create a professional, visually appealing image for a LinkedIn post about: ${postContent?.substring(0, 500) || 'professional content'}. 

Visual Style: ${styleGuide}

Requirements:
- Eye-catching composition
- No text overlays, just visual imagery
- Aspect ratio: 16:9 landscape format ideal for LinkedIn feed
- High quality, professional finish`;

    // Call Lovable AI with image generation model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: imagePrompt,
          },
        ],
        modalities: ["image", "text"],
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
      return new Response(JSON.stringify({ error: "Erro ao gerar imagem. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("AI Response received");

    // Extract the image from the response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Não foi possível gerar a imagem. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      imageUrl,
      description: textContent || "Imagem gerada com sucesso"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-image:", error);
    return new Response(JSON.stringify({ error: "Erro ao gerar imagem. Tente novamente." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
