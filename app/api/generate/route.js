import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { profile, focusArea } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Use the same auto-model logic or just gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `
      You are a specialized scriptwriter for leadership simulations.
      USER PROFILE: ${profile.level} ${profile.role} in ${profile.industry}.
      FOCUS AREA: ${focusArea}.

      TASK:
      Generate a high-stakes, realistic "uncomfortable" leadership scenario.
      The user must be forced to make a hard choice where there is no easy answer.
      
      Return ONLY JSON:
      {
        "headline": "A 1-sentence high-stakes problem statement.",
        "context": "A quote from a difficult stakeholder pushing for the WRONG thing.",
        "stakeholderTitle": "e.g., The CEO, The Head of Sales, etc."
      }
    `;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const data = await response.json();
    return NextResponse.json(JSON.parse(data.candidates[0].content.parts[0].text));
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate scenario" }, { status: 500 });
  }
}
