import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { profile, focusArea } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    // 1. AUTO-DISCOVER: Find out exactly which model names work for your UK key
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();

    if (listData.error) {
      return NextResponse.json({ error: listData.error.message }, { status: 400 });
    }

    // 2. PICK THE BEST MODEL: Search for anything with "flash" in the name
    const availableModels = listData.models || [];
    const bestModel = availableModels.find(m => m.name.includes("flash"))?.name || "models/gemini-1.5-flash";

    console.log("Generator using discovered model:", bestModel);

    // 3. GENERATE SCENARIO
    const url = `https://generativelanguage.googleapis.com/v1beta/${bestModel}:generateContent?key=${apiKey}`;

    const prompt = `
      You are a leadership coach. Create a high-stakes scenario for a ${profile.level} ${profile.role}.
      Focus Area: ${focusArea}.
      Return ONLY JSON:
      {
        "headline": "A 1-sentence high-stakes problem statement.",
        "context": "A quote from a difficult stakeholder pushing for the WRONG thing.",
        "stakeholderTitle": "Job title of the person speaking"
      }
    `;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const data = await response.json();
    
    if (data.error) {
       throw new Error(data.error.message);
    }

    const cleanJson = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Critical Gen Error:", error.message);
    return NextResponse.json({ 
        headline: "Scenario Engine Error", 
        context: "The AI was unable to generate a scenario. Error: " + error.message, 
        stakeholderTitle: "System" 
    });
  }
}
