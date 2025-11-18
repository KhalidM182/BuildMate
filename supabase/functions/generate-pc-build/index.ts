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
    const { budget, useCase, customRequirements } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert PC builder with deep knowledge of hardware compatibility, performance optimization, and price-to-performance ratios. Your goal is to recommend three PC build tiers (Good, Better, Best) within the user's budget.

For each build, provide:
1. Complete component list with specific models and prices
2. Performance expectations for the use case
3. Bottleneck analysis
4. Compatibility notes
5. Total estimated cost

Use realistic current market prices and ensure all components are compatible.`;

    const userPrompt = `Create three optimized PC builds (Good, Better, Best tiers) for:
- Budget: $${budget}
- Primary Use Case: ${useCase}
${customRequirements ? `- Custom Requirements: ${customRequirements}` : ''}

For each tier, provide a JSON response with this structure:
{
  "builds": [
    {
      "tier": "Good|Better|Best",
      "totalCost": number,
      "performanceScore": number (1-10),
      "bottleneckPercentage": number,
      "powerConsumption": number,
      "components": {
        "cpu": { "model": "", "price": number, "reason": "" },
        "gpu": { "model": "", "price": number, "reason": "" },
        "ram": { "model": "", "price": number, "reason": "" },
        "motherboard": { "model": "", "price": number, "reason": "" },
        "storage": { "model": "", "price": number, "reason": "" },
        "psu": { "model": "", "price": number, "reason": "" },
        "case": { "model": "", "price": number, "reason": "" },
        "cooling": { "model": "", "price": number, "reason": "" }
      },
      "performanceExpectations": {
        "gaming": "",
        "productivity": "",
        "ml": ""
      },
      "compatibilityNotes": ""
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
          // Wait before retry (exponential backoff)
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
          console.error(`AI gateway error (attempt ${attempt + 1}):`, response.status, errorText.substring(0, 200));
          
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
              error: "AI service credits depleted. Please contact support." 
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

        // Success! Parse and return the response
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        console.log("AI Response received successfully");
        
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
    
    // If we get here, all retries failed
    throw lastError || new Error("Failed to generate builds after retries");

  } catch (error) {
    console.error("Error in generate-pc-build:", error);
    
    // Provide user-friendly error messages
    let errorMessage = "Failed to generate builds. Please try again.";
    
    if (error instanceof Error) {
      if (error.message.includes("temporary error") || error.message.includes("500")) {
        errorMessage = "The AI service is temporarily unavailable. Please try again in a moment.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
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
