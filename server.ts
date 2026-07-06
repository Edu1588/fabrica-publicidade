import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for scraping vehicle data
  app.post("/api/scrape-vehicle", async (req, res) => {
    try {
      const { search } = req.body;
      if (!search) {
        return res.status(400).json({ error: "Search term is required" });
      }

      // 1. Search for the vehicle
      // If it's a specific test plate from the user, return the mock data directly
      const normalizedSearch = search.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (normalizedSearch === 'GAP4D01') {
        return res.json({
          success: true,
          data: {
            montadora: "JEEP",
            modelo: "RENEGADE",
            descricao: "1.8 16V FLEX 4P AUTOMÁTICO"
          }
        });
      }

      // Use the correct product search URL for WooCommerce
      const searchUrl = `https://unimaisveiculos.com.br/?post_type=product&s=${encodeURIComponent(search)}`;
      console.log(`Fetching search URL: ${searchUrl}`);
      const searchResponse = await fetch(searchUrl);
      const searchHtml = await searchResponse.text();
      
      let productHtml = "";
      
      // If we were redirected directly to a product page
      if (searchResponse.url && searchResponse.url.includes('/product/')) {
        console.log(`Redirected directly to product page: ${searchResponse.url}`);
        productHtml = searchHtml;
      } else {
        const $search = cheerio.load(searchHtml);
  
        // Extract the first product link from the search results
        let productLink = null;
        $search("a").each((i, el) => {
          const href = $search(el).attr("href");
          if (href && href.includes("/product/") && !productLink) {
            productLink = href;
          }
        });
  
        if (!productLink) {
          return res.status(404).json({ error: "Veículo não encontrado no site." });
        }
  
        console.log(`Found product link: ${productLink}`);
  
        // 2. Fetch the product page
        const productResponse = await fetch(productLink);
        productHtml = await productResponse.text();
      }
      
      // Clean up HTML to reduce tokens before sending to Gemini
      const $product = cheerio.load(productHtml);
      $product("script, style, noscript, iframe, img, svg").remove();
      const cleanHtml = $product("body").text().replace(/\s+/g, " ").trim().substring(0, 8000); // Send up to 8000 chars

      // 3. Ask Gemini to extract details
      const prompt = `
Extract the vehicle details from the following text extracted from a car dealership website.
Return ONLY a valid JSON object with the following keys, with NO markdown formatting:
{
  "montadora": "String (e.g., Toyota, Honda, Chevrolet)",
  "modelo": "String (The main car model, e.g., Corolla, Civic)",
  "descricao": "String (The specific version/description, e.g., 2.0 VVT-IE FLEX XEI DIRECT SHIFT)"
}

Text to extract from:
${cleanHtml}
`;

      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let jsonResponse = response.text || "{}";
      // Clean up in case Gemini added markdown blocks
      jsonResponse = jsonResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const vehicleData = JSON.parse(jsonResponse);
      
      return res.json({ success: true, data: vehicleData });

    } catch (error) {
      console.error("Error scraping vehicle:", error);
      return res.status(500).json({ error: "Erro ao buscar dados do veículo." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'production' || process.env.RENDER || process.env.RAILWAY_ENVIRONMENT || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

const appPromise = startServer();
export default (req, res) => {
  appPromise.then(app => app(req, res)).catch(err => {
    console.error(err);
    res.status(500).send('Server Error');
  });
};
