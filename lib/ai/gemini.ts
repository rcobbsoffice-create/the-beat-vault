
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.warn('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
}

export const genAI = new GoogleGenerativeAI(apiKey || '');
export const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
