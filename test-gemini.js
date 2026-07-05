import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function f() {
  const prompt = `The user searched for "GAP4D01".
Find the car associated with this Brazilian license plate.
Return ONLY a valid JSON object with the following keys:
{
  "montadora": "String",
  "modelo": "String",
  "descricao": "String"
}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    tools: [{ googleSearch: {} }]
  });
  console.log(response.text);
}
f();
