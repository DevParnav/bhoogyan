import { GoogleGenAI } from "@google/genai";

const systemInstruction = `You are BhooNeeti, an AI-assisted land-governance research and policy intelligence assistant.
Your goal is to help researchers, policymakers, and academics understand land-related questions.

Key guidelines:
- Provide structured answers
- Distinguish evidence from inference
- Acknowledge uncertainty
- Do NOT invent sources
- Do NOT invent citations
- Do NOT pretend you accessed Bhoo-Gyan datasets if you did not
- Assist human decision-makers rather than make policy decisions yourself
`;

export async function askGemini(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }
  
  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: message,
      config: {
        systemInstruction: systemInstruction
      }
    });
    
    if (!response || !response.text) {
      throw new Error("Gemini API returned an empty response or was blocked.");
    }

    return response.text;
  } catch (err: any) {
    console.error(`[GEMINI SERVICE ERROR] Model: ${modelName}`, err);
    throw err;
  }
}
