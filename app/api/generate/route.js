import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { profile, focusArea } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Use v1beta and 1.5-flash for speed and reliability
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
      You are a leadership coach. Create a high-stakes scenario for a ${profile.level} ${profile.role}.
      Topic: ${focusArea}.
      
      Return ONLY a JSON object with these EXACT keys:
      {
        "headline": "Describe a difficult situation in 1 sentence",
        "context": "A quote from a stakeholder making a wrong/difficult request",
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
    
    // Robust cleaning logic
    let rawText = data.candidates[0].content.parts[0].text;
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gen Error:", error);
    return NextResponse.json({ 
        headline: "Error generating scenario", 
        context: "Please try again in a moment.", 
        stakeholderTitle: "System" 
    });
  }
}
