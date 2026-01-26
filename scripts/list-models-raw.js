
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log(`Fetching models from: ${url.replace(apiKey, 'HIDDEN_KEY')}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', JSON.stringify(data, null, 2));
    } else {
      console.log('Available Models:', data.models.map(m => m.name));
    }
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

listModels();
