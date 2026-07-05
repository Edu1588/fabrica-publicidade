import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function f() {
  const prompt = `Can you lookup the exact vehicle for Brazilian license plate "GAP4D01" using real APIs or Google search if you have access to it? Tell me the make and model.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    tools: [{ googleSearch: {} }]
  });
  console.log(response.text);
}
f();
