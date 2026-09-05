import { GoogleGenAI } from "@google/genai";

export async function generateEmbedding(text: string, taskType: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT" = "RETRIEVAL_QUERY"): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const modelName = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log(`[EMBEDDING] Starting embedding generation with model: ${modelName}, taskType: ${taskType}`);
    const response = await ai.models.embedContent({
      model: modelName,
      contents: text,
      config: {
        taskType: taskType,
      },
    });

    const embedding = response.embeddings?.[0]?.values;
    
    if (!embedding || embedding.length === 0) {
      throw new Error("Gemini API returned an empty embedding.");
    }

    console.log(`[EMBEDDING] Successfully generated embedding with dimension: ${embedding.length}`);
    return embedding;
  } catch (err: any) {
    console.error(`[EMBEDDING ERROR] Model: ${modelName}`, err.message || String(err));
    throw err;
  }
}
