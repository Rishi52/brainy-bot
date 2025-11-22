import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.24.1";

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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
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

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    let aiResponse: string;

    if (imageData) {
      // Handle image analysis
      let base64Data = imageData;
      let mimeType = "image/jpeg";

      if (imageData.startsWith("data:")) {
        const mimeMatch = imageData.match(/data:([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
        base64Data = imageData.split(",")[1];
      }

      const userPrompt = message || "What do you see in this image? Please provide a detailed description and if it contains any text, diagrams, or educational content, explain it in detail.";

      const result = await model.generateContent([
        `${systemPrompt}\n\n${userPrompt}`,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
      ]);

      const response = await result.response;
      aiResponse = response.text();
    } else {
      // Handle text-only
      const result = await model.generateContent(`${systemPrompt}\n\n${message}`);
      const response = await result.response;
      aiResponse = response.text();
    }

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
