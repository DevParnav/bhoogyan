import { GoogleGenerativeAI } from "@google/generative-ai";

const systemInstruction = `You are BhooNeeti, an AI-assisted land-governance research and policy intelligence assistant.

Your role is to help researchers, policymakers, academics and government stakeholders understand land-related questions.

Provide structured, clear and evidence-oriented responses.

Do not claim that information is sourced from a dataset, paper, government report, satellite image, or official source unless that information has actually been provided to you or retrieved by the application.

Do not invent citations, papers, government policies, statistics, satellite observations, or datasets.

Clearly distinguish between:
- established information
- inference
- uncertainty
- recommendations

You assist human decision-makers. You do not make policy decisions yourself.

When evidence is unavailable, explicitly say that additional evidence or data is required.`;

export async function askGemini(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }
  
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);

  const generateWithModel = async (modelId: string, useSystemInstruction: boolean) => {
    const modelOptions: any = { model: modelId };
    if (useSystemInstruction) {
      modelOptions.systemInstruction = systemInstruction;
    }
    const model = genAI.getGenerativeModel(modelOptions);
    const result = await model.generateContent(message);
    
    if (!result.response) {
      throw new Error("Gemini API returned an empty response object.");
    }
    
    const candidates = result.response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("Gemini API returned no candidates. The request might have been blocked by safety filters.");
    }

    const text = result.response.text();
    if (!text) {
      throw new Error("Gemini API returned empty text.");
    }
    
    return text;
  };

  try {
    // Attempt with the primary model
    return await generateWithModel(modelName, true);
  } catch (err: any) {
    // If the model is not found (404), fallback to the older gemini-pro
    if (err.message && err.message.includes('404 Not Found')) {
      console.warn(`[GEMINI SERVICE] Model ${modelName} not found. Falling back to gemini-pro...`);
      try {
        // Since gemini-pro does not natively support systemInstruction, we prepend it to the prompt
        const modelOptions = { model: 'gemini-pro' };
        const model = genAI.getGenerativeModel(modelOptions);
        
        const fallbackMessage = `${systemInstruction}\n\nUser Question:\n${message}`;
        const result = await model.generateContent(fallbackMessage);
        
        if (!result.response) throw new Error("Gemini API returned an empty response object.");
        const candidates = result.response.candidates;
        if (!candidates || candidates.length === 0) throw new Error("Gemini API returned no candidates. Blocked by safety filters.");
        const text = result.response.text();
        if (!text) throw new Error("Gemini API returned empty text.");
        
        return text;
      } catch (fallbackErr: any) {
        console.error("[GEMINI SERVICE ERROR during fallback]:", fallbackErr);
        throw fallbackErr;
      }
    }
    
    console.error("[GEMINI SERVICE ERROR]:", err);
    throw err;
  }
}
