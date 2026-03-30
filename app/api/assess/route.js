import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userInput, profile, scenario } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    // 1. AUTO-DISCOVERY: Ask Google which models this UK key is allowed to use
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();

    if (listData.error) {
      console.error("Discovery Error:", listData.error.message);
      return NextResponse.json({ error: listData.error.message }, { status: 400 });
    }

    // 2. FIND BEST MODEL: Prioritize 1.5-flash or 1.5-pro
    const availableModels = listData.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    const bestModel = availableModels.find(m => m.name.includes("gemini-1.5-flash"))?.name 
                   || availableModels.find(m => m.name.includes("gemini-1.5-pro"))?.name
                   || availableModels[0]?.name;

    if (!bestModel) throw new Error("No usable models found.");
    console.log("Using discovered model:", bestModel);

    // 3. EXECUTE ASSESSMENT
    const url = `https://generativelanguage.googleapis.com/v1beta/${bestModel}:generateContent?key=${apiKey}`;

    const systemPrompt = `
      Role: Leadership Coach. 
      Profile: ${profile.level} ${profile.role} in ${profile.industry}.
      Scenario: ${scenario.headline}.
      Task: Score (1-10) for Clarity, Ruthlessness, Ownership. 
      Return ONLY JSON: {"scores": {"Clarity":0, "Ruthlessness":0, "Ownership":0}, "feedback": "text", "rewrite": "text"}
    `;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\nUser Response: " + userInput }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
       return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const result = JSON.parse(data.candidates[0].content.parts[0].text);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Critical Failure:", error);
    return NextResponse.json({ error: "The AI could not process this request." }, { status: 500 });
  }
}
