import { askGemini } from './app/api/services/geminiService';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function test() {
  try {
    const res = await askGemini("Reply with exactly: BhooNeeti is online.");
    console.log("RESPONSE:", res);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
