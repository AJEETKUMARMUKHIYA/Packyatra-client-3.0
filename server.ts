import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware with increased size limit for base64 room images
  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini client on the server side
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined.");
  }

  // API routes first
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Room scan endpoint using Gemini Multimodal Estimator
  app.post("/api/gemini/scan-room", async (req, res) => {
    try {
      const { images, validItems } = req.body;

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "No media files provided for analysis." });
      }

      if (!validItems || !Array.isArray(validItems) || validItems.length === 0) {
        return res.status(400).json({ error: "No inventory list provided for matching." });
      }

      if (!ai) {
        return res.status(500).json({
          error: "Gemini API client is not initialized. Please configure the GEMINI_API_KEY secret.",
        });
      }

      // Convert media base64 strings to parts for Gemini
      const parts: any[] = [];
      for (const base64File of images) {
        let mimeType = "image/jpeg";
        let data = base64File;

        if (base64File.startsWith("data:")) {
          const match = base64File.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            data = match[2];
          }
        }
        parts.push({
          inlineData: {
            mimeType,
            data,
          },
        });
      }

      // Instructions prompt
      const prompt = `You are an expert packers and movers inventory estimator. Your task is to analyze the provided images or video walkthroughs of rooms and identify household furniture, appliances, boxes, and other items that need to be moved.

You are provided with a list of valid inventory items that our moving company supports:
${JSON.stringify(validItems, null, 2)}

For each item you detect in the image(s) or video(s):
1. Match it to the most relevant item in the provided list. Do not invent items that are not in the list.
2. Estimate the quantity of that item (only include it if quantity is 1 or more).
3. Be realistic: don't list tiny decoration items unless they match an explicit item. Prioritize main furniture (beds, sofas, tables, chairs, wardrobes, cabinets), appliances (TV, fridge, washing machine, AC), and boxes/luggage.

You must respond ONLY with a JSON array of objects, containing the exact 'itemID' and the estimated 'quantity'.
Example output format:
[
  { "itemID": "101", "quantity": 1 },
  { "itemID": "102", "quantity": 2 }
]

Do not include any markdown formatting (do NOT wrap in \`\`\`json ... \`\`\`), explanation, or other text. Respond with pure valid JSON.`;

      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "[]";
      console.log("Gemini scanned response:", responseText);

      try {
        const parsedItems = JSON.parse(responseText.trim());
        res.json({ items: parsedItems });
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON. Raw text:", responseText);
        // Fallback: search for array in text if it returned markdown
        const arrayMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
          const parsedItems = JSON.parse(arrayMatch[0]);
          res.json({ items: parsedItems });
        } else {
          res.status(500).json({
            error: "Failed to parse inventory recommendations from AI. Please try another photo.",
            raw: responseText,
          });
        }
      }
    } catch (error: any) {
      console.error("Error during room scan:", error);
      res.status(500).json({ error: error.message || "An error occurred during image scanning." });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
