import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (req.method === "GET") {
      // Fetch user profile
      const { data, error } = await supabaseClient
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return new Response(JSON.stringify({ profile: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (req.method === "POST" || req.method === "PUT") {
      // Create or update user profile
      const { age, education_level } = await req.json();

      if (!age || !education_level) {
        throw new Error("Age and education level are required");
      }

      const { data, error } = await supabaseClient
        .from("user_profiles")
        .upsert(
          {
            user_id: user.id,
            age,
            education_level,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ profile: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Method not allowed");
    }
  } catch (error) {
    console.error("Error in user-profile function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
