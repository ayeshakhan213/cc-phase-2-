const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/google-genai');

// Configure genkit with Google GenAI plugin. Ensure env vars for Google credentials are provided in production.
const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

// Minimal service-layer equivalent
async function processQuery(input) {
  const productData = JSON.stringify(require('./products').products, null, 2);

  const prompt = ai.definePrompt({
    name: 'serviceLayerPrompt',
    input: { schema: ai.z?.object?.({}) || {} },
    output: { schema: ai.z?.object?.({}) || {} },
    prompt: `You are a sophisticated backend assistant. Here is the product data:\n\n${productData}\n\nQuery: ${input.query}`,
    model: 'googleai/gemini-1.5-pro-latest',
  });

  const { output } = await prompt({ query: input.query, productData });
  return output;
}

module.exports = { ai, processQuery };
