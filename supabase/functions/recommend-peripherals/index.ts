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
    const { budget, build, useCase } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert in computer peripherals with deep knowledge of gaming monitors, keyboards, mice, and headsets. Your goal is to recommend peripherals that complement the PC build and use case.`;

    const userPrompt = `Recommend peripherals for this PC build:
Build Details:
- Budget Remaining: $${budget}
- Use Case: ${useCase}
- CPU: ${build.components.cpu.model}
- GPU: ${build.components.gpu.model}

Provide recommendations for monitor, keyboard, mouse, and headset in this JSON format:
{
  "peripherals": [
    {
      "category": "monitor|keyboard|mouse|headset",
      "model": "specific model name",
      "price": number,
      "reason": "why this is recommended",
      "specs": {
        "key": "value pairs of important specs"
      }
    }
  ]
}`;

    // Retry logic for transient errors
    let lastError;
    const maxRetries = 2;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} of ${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`AI gateway error (attempt ${attempt + 1}):`, response.status);
          
          if (response.status === 429) {
            return new Response(JSON.stringify({ 
              error: "Rate limit exceeded. Please try again in a moment." 
            }), {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          
          if (response.status === 402) {
            return new Response(JSON.stringify({ 
              error: "AI service credits depleted." 
            }), {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          
          // For 500 errors, retry if we have attempts left
          if (response.status === 500 && attempt < maxRetries) {
            lastError = new Error(`AI Gateway temporary error: ${response.status}`);
            continue;
          }
          
          throw new Error(`AI Gateway error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        console.log("Peripherals response received successfully");
        
        return new Response(aiResponse, {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        
      } catch (fetchError) {
        lastError = fetchError;
        if (attempt < maxRetries) {
          const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
          console.error(`Attempt ${attempt + 1} failed:`, errorMsg);
          continue;
        }
        throw fetchError;
      }
    }
    
    throw lastError || new Error("Failed to generate peripherals after retries");
    
  } catch (error) {
    console.error("Error in recommend-peripherals:", error);
    
    let errorMessage = "Failed to generate peripheral recommendations. Please try again.";
    
    if (error instanceof Error) {
      if (error.message.includes("temporary error") || error.message.includes("500")) {
        errorMessage = "The AI service is temporarily unavailable. Please try again in a moment.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
