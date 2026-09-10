import { GoogleGenAI } from "@google/genai";
import { EvidenceChunk } from "./evidenceService";

const systemInstruction = `You are BhooNeeti, an evidence-grounded land intelligence assistant.
Your goal is to help researchers, policymakers, and academics understand land-related questions based strictly on the provided evidence.

Key guidelines:
- Answer using ONLY the retrieved evidence provided to you.
- Do NOT invent numerical values, locations, satellite observations, classifications, trends, risks, or conclusions.
- If the retrieved evidence does not contain enough information to answer the question, explicitly state that the available evidence is insufficient.
- Distinguish observed data from model-derived analysis and inference.
- Always preserve source provenance and explicitly cite the Scene ID or data source in your answer.
- Assist human decision-makers rather than make policy decisions yourself.`;

export async function askGemini(message: string, context: EvidenceChunk[] = []): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }
  
  const modelName = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
  const ai = new GoogleGenAI({ apiKey });

  try {
    // Build prompt with context if available
    let fullPrompt = message;
    if (context && context.length > 0) {
      const evidenceText = context.map((c, i) => `[Evidence ${i + 1}] Source: ${c.metadata.source} | ID: ${c.metadata.sceneId} | Date: ${c.metadata.acquisitionDate}\nContent:\n${c.text}`).join('\n\n');
      
      fullPrompt = `User Question: ${message}\n\nRetrieved Evidence for this AOI:\n${evidenceText}\n\nRemember: Answer ONLY using the evidence above. If the evidence is insufficient, state that. Cite your sources.`;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
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
