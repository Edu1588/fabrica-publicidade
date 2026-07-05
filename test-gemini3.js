import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function f() {
  const prompt = `Search the internet for the Brazilian license plate "GAP4D01".
Find the exact make, model, and version of this car.
Return ONLY a valid JSON object:
{"montadora": "Make", "modelo": "Model", "descricao": "Version"}
`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    tools: [{ googleSearch: {} }]
  });
  console.log(response.text);
}
f();
