import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, subject, conversationId, imageData } = await req.json();

    if (!message && !imageData) {
      throw new Error("Message or image is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create subject-specific system prompts
    const subjectPrompts: Record<string, string> = {
      math: "You are an expert mathematics tutor. Provide step-by-step solutions with clear explanations. Use LaTeX notation for mathematical expressions (e.g., $x^2$ for inline math, $$equation$$ for block math). Break down complex problems into manageable steps.",
      science: "You are an expert science tutor. Explain concepts clearly with real-world examples. Break down complex topics into understandable parts. Use analogies when helpful.",
      coding: "You are an expert programming tutor. Provide clear code examples with explanations. Explain concepts step-by-step and suggest best practices. Format code properly.",
      history: "You are an expert history tutor. Provide context, dates, and connections between events. Explain causes and effects clearly.",
      language: "You are an expert language tutor. Explain grammar, vocabulary, and usage clearly. Provide examples and practice suggestions.",
      general: "You are BrainyBot, an AI study companion. Provide clear, step-by-step explanations tailored to students. Break down complex topics into understandable parts. Be encouraging and supportive.",
    };

    const systemPrompt = subjectPrompts[subject] || subjectPrompts.general;

    // Prepare user content (text or image)
    let userContent;
    if (imageData) {
      // Handle image input
      userContent = [
        {
          type: "image_url",
          image_url: {
            url: imageData,
          },
        },
        {
          type: "text",
          text: message || "What do you see in this image? Please provide a detailed description and if it contains any text, diagrams, or educational content, explain it in detail.",
        },
      ];
    } else {
      userContent = message;
    }

    // Call Lovable AI Gateway with Gemini
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        conversationId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat-ai function:", error);
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
