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

  try {
    const modelOptions: any = { 
      model: modelName,
      systemInstruction: systemInstruction 
    };
    
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
  } catch (err: any) {
    if (err.message && err.message.includes('404 Not Found')) {
      console.warn(`[GEMINI SERVICE] Model ${modelName} not found. Attempting to auto-discover available models...`);
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (response.ok) {
          const data = await response.json();
          const models = data.models || [];
          
          // Find the first model that supports generateContent
          const validModel = models.find((m: any) => 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes('generateContent') &&
            m.name.includes('gemini')
          );
          
          if (validModel) {
            const discoveredModelName = validModel.name.replace('models/', '');
            console.log(`[GEMINI SERVICE] Auto-discovered supported model: ${discoveredModelName}. Attempting generation...`);
            
            const fallbackOptions: any = { model: discoveredModelName };
            // gemini-pro does not support systemInstruction, so only add it if it's not the old pro
            if (!discoveredModelName.includes('gemini-pro') || discoveredModelName.includes('1.5')) {
              fallbackOptions.systemInstruction = systemInstruction;
            }
            
            const fbModel = genAI.getGenerativeModel(fallbackOptions);
            let result;
            if (!fallbackOptions.systemInstruction) {
               const fallbackMessage = `${systemInstruction}\n\nUser Question:\n${message}`;
               result = await fbModel.generateContent(fallbackMessage);
            } else {
               result = await fbModel.generateContent(message);
            }
            
            if (result.response && result.response.candidates && result.response.candidates.length > 0) {
              const text = result.response.text();
              if (text) return text;
            }
          } else {
            console.error("[GEMINI SERVICE] No valid models supporting generateContent found for this API key.");
            console.log("Available models:", models.map((m: any) => m.name).join(', '));
          }
        } else {
          console.error(`[GEMINI SERVICE] Failed to fetch models list: ${response.statusText}`);
        }
      } catch (discoveryErr) {
        console.error("[GEMINI SERVICE] Auto-discovery failed:", discoveryErr);
      }
    }
    
    console.error(`[GEMINI SERVICE ERROR] Model: ${modelName}`, err);
    throw err;
  }
}
