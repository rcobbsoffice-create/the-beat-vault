
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGemini() {
  console.log('--- Testing Gemini API ---');
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log('Key exists:', !!apiKey);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // List models first
    console.log('Listing available models...');
    const modelRecord = await genAI.getGenerativeModel({ model: 'gemini-pro' }); // Dummy init to access potentially unavailable methods? No, genAI has listModels?
    // Actually, looking at docs, it's genAI.listModels() ? No, usually via fetch or specialized Admin API in some SDKs.
    // But let's try a known model like 'gemini-pro' just to see if that works, OR try to find the right name.
    
    // Correct way in node SDK might be just trying `gemini-1.0-pro`?
    // Let's try to catch the error and log it, but wait...
    // The previous error suggested "Call ListModels". 
    // The SDK might not expose listModels easily on the main client.
    
    // Let's try more specific versions.
    const models = [
      'gemini-2.0-flash', 
      'gemini-2.0-flash-lite', 
      'gemini-flash-latest'
    ];
    
    for (const modelName of models) {
      console.log(`Trying model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        console.log(`SUCCESS with ${modelName}!`);
        return; 
      } catch (e) {
        console.log(`Failed ${modelName}: ${e.message.split('\n')[0]}`);
      }
    }

  } catch (err) {
    console.error('FAILURE: Gemini API Error');
    console.error(err);
  }
}

testGemini();
