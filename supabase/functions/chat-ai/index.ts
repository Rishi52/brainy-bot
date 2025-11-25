import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.24.1";
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
    const { message, subject, conversationId, imageData, conversationHistory } = await req.json();

    if (!message && !imageData) {
      throw new Error("Message or image is required");
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Fetch user profile
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

    let userContext = "";
    if (user) {
      const { data: profile } = await supabaseClient
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        userContext = `\n\nUser Context: The student is ${profile.age} years old and in ${profile.education_level} grade/level. Adjust your explanations and vocabulary to be appropriate for this education level.`;
      }
    }

    // Create subject-specific system prompts
    const subjectPrompts: Record<string, string> = {
      math: `You are an expert mathematics tutor. Provide step-by-step solutions with clear explanations. Use LaTeX notation for mathematical expressions (e.g., $x^2$ for inline math, $$equation$$ for block math). Break down complex problems into manageable steps.${userContext}`,
      science: `You are an expert science tutor. Explain concepts clearly with real-world examples. Break down complex topics into understandable parts. Use analogies when helpful.${userContext}`,
      coding: `You are an expert programming tutor. Provide clear code examples with explanations. Explain concepts step-by-step and suggest best practices. Format code properly.${userContext}`,
      history: `You are an expert history tutor. Provide context, dates, and connections between events. Explain causes and effects clearly.${userContext}`,
      language: `You are an expert language tutor. Explain grammar, vocabulary, and usage clearly. Provide examples and practice suggestions.${userContext}`,
      general: `You are BrainyBot, an AI study companion. Provide clear, step-by-step explanations tailored to students. Break down complex topics into understandable parts. Be encouraging and supportive.${userContext}`,
    };

    const systemPrompt = subjectPrompts[subject] || subjectPrompts.general;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
      },
    });

    // Build conversation history for Gemini
    const chatHistory = conversationHistory || [];
    
    // Add current message with or without image
    if (imageData) {
      let base64Data = imageData;
      let mimeType = "image/jpeg";

      if (imageData.startsWith("data:")) {
        const mimeMatch = imageData.match(/data:([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
        base64Data = imageData.split(",")[1];
      }

      const userPrompt = message || "What do you see in this image? Please provide a detailed description.";
      
      // For images, use generateContent with history
      const result = await model.generateContentStream({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...chatHistory.map((msg: any) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          })),
          {
            role: "user",
            parts: [
              { text: userPrompt },
              { inlineData: { data: base64Data, mimeType } }
            ]
          }
        ]
      });

      // Create readable stream
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    } else {
      // For text-only, use chat with history
      const history = chatHistory.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "I understand. I'll help you with your questions." }] },
          ...history
        ]
      });

      const result = await chat.sendMessageStream(message);

      // Create readable stream
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }
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
