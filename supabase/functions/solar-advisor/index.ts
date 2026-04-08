import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SolarCalculation {
  appliances: Array<{
    name: string;
    watts: number;
    hours: number;
    quantity: number;
  }>;
  location: string;
  peakSunHours: number;
  autonomyDays: number;
  systemVoltage: number;
  depthOfDischarge: number;
  batteryType: string;
  totalDailyConsumption: number;
  totalPeakLoad: number;
  recommendedBatteryCapacity: number;
  recommendedInverterSize: number;
  recommendedSolarPanels: number;
  estimatedCost: {
    battery: number;
    inverter: number;
    panels: number;
    installation: number;
    total: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { calculation }: { calculation: SolarCalculation } = await req.json();
    
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a comprehensive prompt for the AI solar advisor
    const applianceList = calculation.appliances
      .map(a => `- ${a.name}: ${a.watts}W x ${a.quantity} units, used ${a.hours} hours/day = ${a.watts * a.quantity * a.hours}Wh/day`)
      .join("\n");

    const systemPrompt = `You are PawaMore's expert solar energy advisor for Nigeria. You are trained in solar system design, Nigerian electricity costs (NERC tariffs), local climate patterns, and the Nigerian solar market. You provide personalized, actionable advice to help customers make informed decisions about their solar investments.

Your tone is friendly, knowledgeable, and focused on helping the customer understand their needs and why PawaMore's solutions are ideal for them.

Key facts about Nigeria's solar context:
- Average grid electricity cost: ₦68-225/kWh depending on customer class
- Frequent power outages (often 4-12+ hours daily in many areas)
- Average peak sun hours: 4-6 hours depending on region (north has more sun)
- Diesel generators cost ₦350-500/kWh to run
- LiFePO4 batteries last 3000-5000 cycles vs lead-acid 300-500 cycles

Always provide:
1. A personalized analysis of their power needs
2. Why the recommended system is right for them
3. Cost-benefit analysis compared to generators/grid
4. Tips for optimizing their system
5. Why they should buy from PawaMore (quality, warranty, installation support, after-sales service)

Format your response with clear sections using markdown.`;

    const userPrompt = `Analyze this solar calculation for a customer in ${calculation.location || "Nigeria"}:

**Load Profile:**
${applianceList}

**Total Daily Consumption:** ${(calculation.totalDailyConsumption / 1000).toFixed(2)} kWh/day
**Peak Load:** ${calculation.totalPeakLoad}W

**System Parameters:**
- Peak Sun Hours: ${calculation.peakSunHours} hours
- Autonomy Days: ${calculation.autonomyDays} days (backup without sun)
- System Voltage: ${calculation.systemVoltage}V
- Battery Type: ${calculation.batteryType}
- Depth of Discharge: ${(calculation.depthOfDischarge * 100).toFixed(0)}%

**Recommended System:**
- Battery Capacity: ${calculation.recommendedBatteryCapacity.toFixed(1)} kWh
- Inverter Size: ${calculation.recommendedInverterSize}W
- Solar Panels: ${calculation.recommendedSolarPanels} panels (410W each)

**Estimated Investment:**
- Battery System: ₦${calculation.estimatedCost.battery.toLocaleString()}
- Inverter: ₦${calculation.estimatedCost.inverter.toLocaleString()}
- Solar Panels: ₦${calculation.estimatedCost.panels.toLocaleString()}
- Installation: ₦${calculation.estimatedCost.installation.toLocaleString()}
- **Total: ₦${calculation.estimatedCost.total.toLocaleString()}**

Please provide a comprehensive, personalized analysis for this customer. Include:
1. Assessment of their power needs and usage patterns
2. Why this system size is right for them (or adjustments if needed)
3. Expected monthly savings compared to generators and unstable grid power
4. Return on investment timeline
5. Tips to maximize their solar investment
6. Why PawaMore is the best choice for this purchase (mention our quality products, warranty, expert installation, and after-sales support)

Make it conversational, helpful, and gently persuasive to buy from PawaMore.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate advice", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const advice = data.choices[0]?.message?.content || "Unable to generate advice at this time.";

    return new Response(
      JSON.stringify({ 
        advice,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in solar-advisor function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
