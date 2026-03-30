import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userInput, profile, scenario } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    // List of model names known to work in the UK/EU
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro"
    ];

    const systemPrompt = `
      Role: Leadership Coach. 
      Profile: ${profile.level} ${profile.role}.
      Scenario: ${scenario.headline}.
      Task: Score (1-10) for Clarity, Ruthlessness, Ownership. 
      Return ONLY JSON: {"scores": {"Clarity":0, "Ruthlessness":0, "Ownership":0}, "feedback": "text", "rewrite": "text"}
    `;

    // We try each model until one succeeds
    for (const modelName of modelsToTry) {
      console.log(`Attempting assessment with: ${modelName}`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt + "\n\nUser Response: " + userInput }] }],
            generationConfig: { response_mime_type: "application/json" }
          })
        });

        const data = await response.json();

        // If this specific model worked, return the result immediately
        if (response.ok && data.candidates) {
          const result = JSON.parse(data.candidates[0].content.parts[0].text);
          return NextResponse.json(result);
        }
        
        console.warn(`${modelName} failed, trying next...`);
      } catch (e) {
        console.error(`${modelName} error:`, e.message);
      }
    }

    throw new Error("All Gemini models rejected the request. Check your API key or regional availability.");

  } catch (error) {
    console.error("Critical Failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
