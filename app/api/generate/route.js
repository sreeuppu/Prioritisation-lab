import { NextResponse } from 'next/server';
export async function POST(req) {
  try {
    const { profile, focusArea } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const prompt = `Generate a high-stakes leadership scenario for a ${profile.level} ${profile.role} focusing on ${focusArea}. Return ONLY JSON: {"headline": "problem", "context": "stakeholder quote", "stakeholderTitle": "title"}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { response_mime_type: "application/json" } })
    });
    const data = await response.json();
    return NextResponse.json(JSON.parse(data.candidates[0].content.parts[0].text));
  } catch (error) { return NextResponse.json({ error: "Fail" }, { status: 500 }); }
}
