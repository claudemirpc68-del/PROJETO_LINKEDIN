import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageBase64, style, description, postContent } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "Imagem não fornecida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Saving image for user:", user.id, "Style:", style);

    // Extract base64 data (remove data:image/...;base64, prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Determine content type
    const contentType = imageBase64.startsWith("data:image/jpeg") ? "image/jpeg" 
      : imageBase64.startsWith("data:image/webp") ? "image/webp" 
      : "image/png";

    const extension = contentType === "image/jpeg" ? "jpg" 
      : contentType === "image/webp" ? "webp" 
      : "png";

    // Create unique file path: userId/timestamp-random.ext
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const storagePath = `${user.id}/${timestamp}-${random}.${extension}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("generated-images")
      .upload(storagePath, imageBytes, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Erro ao salvar imagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate a signed URL (bucket is private)
    const { data: urlData, error: signedErr } = await supabase.storage
      .from("generated-images")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days

    if (signedErr || !urlData) {
      console.error("Signed URL error:", signedErr);
      await supabase.storage.from("generated-images").remove([storagePath]);
      return new Response(JSON.stringify({ error: "Erro ao gerar URL da imagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageUrl = urlData.signedUrl;

    // Save metadata to database
    const { data: imageRecord, error: dbError } = await supabase
      .from("generated_images")
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        storage_path: storagePath,
        style: style || "corporativo",
        description: description || null,
        post_content: postContent?.substring(0, 500) || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      // Try to clean up the uploaded file
      await supabase.storage.from("generated-images").remove([storagePath]);
      return new Response(JSON.stringify({ error: "Erro ao salvar metadados da imagem" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Image saved successfully:", imageRecord.id);

    return new Response(JSON.stringify({ 
      id: imageRecord.id,
      imageUrl,
      storagePath,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in save-image:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
