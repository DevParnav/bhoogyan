import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

// Define the evidence structure
export interface EvidenceChunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    sourceType: string;
    sceneId: string;
    analysisType: string;
    aoiHash?: string;
    acquisitionDate: string;
    model: string;
    timestamp: string;
    // Any extra structured data
    [key: string]: any;
  };
  embedding?: number[];
}

const EVIDENCE_FILE = path.join(process.cwd(), 'app', 'data', 'evidenceStore.json');

function getEvidenceStore(): EvidenceChunk[] {
  try {
    if (!fs.existsSync(EVIDENCE_FILE)) {
      // Ensure directory exists
      const dir = path.dirname(EVIDENCE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(EVIDENCE_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(EVIDENCE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[EVIDENCE STORE] Failed to read store:', error);
    return [];
  }
}

function saveEvidenceStore(store: EvidenceChunk[]) {
  try {
    fs.writeFileSync(EVIDENCE_FILE, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error('[EVIDENCE STORE] Failed to write store:', error);
  }
}

export const EvidenceService = {
  async saveEvidence(chunk: EvidenceChunk) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('[EVIDENCE SERVICE] Missing GEMINI_API_KEY. Saving without embedding.');
      } else {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.embedContent({
          model: 'text-embedding-004',
          contents: chunk.text
        });
        
        if (response.embeddings && response.embeddings.length > 0) {
          chunk.embedding = response.embeddings[0].values;
        }
      }

      const store = getEvidenceStore();
      
      // Prevent duplicates by ID or just push
      const existingIdx = store.findIndex(c => c.id === chunk.id);
      if (existingIdx >= 0) {
        store[existingIdx] = chunk;
      } else {
        store.push(chunk);
      }
      
      saveEvidenceStore(store);
      console.log(`[EVIDENCE SERVICE] Saved evidence chunk ${chunk.id}`);
    } catch (error: any) {
      console.error('[EVIDENCE SERVICE] Error saving evidence:', error.message || error);
    }
  },

  async retrieveEvidence(queryText: string, topK: number = 3): Promise<EvidenceChunk[]> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('[EVIDENCE SERVICE] Missing GEMINI_API_KEY. Cannot perform semantic search.');
        return [];
      }

      const store = getEvidenceStore();
      if (store.length === 0) return [];

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: queryText
      });

      const queryEmbedding = response.embeddings?.[0]?.values;
      if (!queryEmbedding) return [];

      // Calculate cosine similarity
      const scored = store
        .filter(c => c.embedding && c.embedding.length > 0)
        .map(chunk => {
          let dotProduct = 0;
          let normA = 0;
          let normB = 0;
          
          for (let i = 0; i < queryEmbedding.length; i++) {
            dotProduct += queryEmbedding[i] * chunk.embedding![i];
            normA += queryEmbedding[i] * queryEmbedding[i];
            normB += chunk.embedding![i] * chunk.embedding![i];
          }
          
          const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
          return { chunk, similarity };
        });

      // Sort by similarity descending
      scored.sort((a, b) => b.similarity - a.similarity);

      // Return top K chunks
      return scored.slice(0, topK).map(s => s.chunk);

    } catch (error: any) {
      console.error('[EVIDENCE SERVICE] Error retrieving evidence:', error.message || error);
      return [];
    }
  }
};
