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

  // Automated booking route using Gemini 3.5 Flash
  app.post("/api/gemini/automated-booking", async (req, res) => {
    try {
      const { message, validItems, timeSlots, currentBookingData } = req.body;

      if (!message || typeof message !== "string" || message.trim() === "") {
        return res.status(400).json({ error: "No message text provided for automated booking processing." });
      }

      if (!ai) {
        return res.status(500).json({
          error: "Gemini API client is not initialized. Please configure the GEMINI_API_KEY secret.",
        });
      }

      // Instructions prompt for extracting shifting information
      const prompt = `You are "PackYatra AI Booking Copilot", an elite automated shift co-ordinator assistant. Your goal is to parse natural language shifting requests, match them against our inventory/services lists, and return a clean structured JSON to pre-populate and automate the booking flow.

You are provided with:
1. User's conversational instructions: "${message}"
2. Currently supported shifting items list (use exact itemIDs from this list):
${JSON.stringify(validItems, null, 2)}
3. Supported shifting timeslots (use the exact "timeSlotID" value for "selectedTimeSlot"):
${JSON.stringify(timeSlots, null, 2)}
4. Existing booking state:
${JSON.stringify(currentBookingData || {}, null, 2)}

Your task:
- Analyze the user's message to identify household furniture, appliances, luggage, or boxes they wish to move. Match each identified item to the most relevant one in the provided inventory list. Keep or merge with items already in the existing booking state unless the user indicates a fresh list or asks to remove items. Keep quantity accurate.
- Extract logistics parameters:
  * "shiftingDate": Parse the date to "YYYY-MM-DD" format (e.g. "25th July", "July 28, 2026", "tomorrow"). If current local time is July 2026, parse relative terms accordingly. Keep existing if not mentioned.
  * "fromAddress": Origin/pickup address. Keep existing if not mentioned.
  * "toAddress": Destination/delivery address. Keep existing if not mentioned.
  * "serviceLift": Pickup elevator/lift available? ("yes", "no", or null).
  * "selectedFloor": Pickup floor level (number, e.g. 3, 0 for ground floor) or null.
  * "serviceLiftdrop": Drop-off elevator/lift available? ("yes", "no", or null).
  * "floordrop": Drop-off floor level (number, e.g. 1, 0 for ground floor) or null.
  * "vanAccessible": Can the moving truck park close to the door? ("yes", "no", or null).
  * "roadDistance": If vanAccessible is "no", what is the approximate distance from road? MUST be exactly one of: "0-50m", "0-100m", "0-150m", "0-200m" or null.
  * "roadDetails": Any details about the long carry or road accessibility, or null.
  * "selectedTimeSlot": Match mentioned time (e.g. "morning", "afternoon", "evening", or specific hours like "10:00 AM", "2:00 PM") to the most relevant timeslot from the supported timeslots list. Set "selectedTimeSlot" to the exact matched "timeSlotID" (e.g., if matched slot is slot ID 1, return 1 or "1").
  * "customerName": Extract user's full name if provided, or null.
  * "customerEmail": Extract user's email address if provided, or null.
  * "customerPhone": Extract user's 10-digit mobile phone number if provided, or null.

You must respond ONLY with a single JSON object. Do not wrap in markdown (do NOT use \`\`\`json ... \`\`\`), do not include any explanatory prefix or suffix. Return only pure valid JSON conforming strictly to the following structure:
{
  "selectedItems": [
    { "itemID": "item_id_from_valid_list", "name": "matched_name", "sizeCFT": 35, "quantity": 1 }
  ],
  "serviceLift": "yes" | "no" | null,
  "selectedFloor": number | null,
  "serviceLiftdrop": "yes" | "no" | null,
  "floordrop": number | null,
  "vanAccessible": "yes" | "no" | null,
  "roadDistance": "0-50m" | "0-100m" | "0-150m" | "0-200m" | null,
  "roadDetails": "string" | null,
  "selectedTimeSlot": "timeSlotID_value" | number | null,
  "shiftingDate": "YYYY-MM-DD" | null,
  "fromAddress": "string" | null,
  "toAddress": "string" | null,
  "customerName": "string" | null,
  "customerEmail": "string" | null,
  "customerPhone": "string" | null,
  "aiReply": "A warm, helpful confirmation message (2-3 sentences) in natural professional language. Summarize what shifting specs or contacts you extracted, confirm what was saved, and politely ask about the next missing information."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      console.log("Gemini parsed booking response:", responseText);

      try {
        const parsedBooking = JSON.parse(responseText.trim());
        res.json(parsedBooking);
      } catch (parseError) {
        console.error("Failed to parse Gemini booking response as JSON. Raw text:", responseText);
        const objectMatch = responseText.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          const parsedBooking = JSON.parse(objectMatch[0]);
          res.json(parsedBooking);
        } else {
          res.status(500).json({
            error: "Failed to parse shifting specifications from AI. Please try describing your move differently.",
            raw: responseText,
          });
        }
      }
    } catch (error: any) {
      console.error("Error during automated booking parse:", error);
      res.status(500).json({ error: error.message || "An error occurred during automated booking processing." });
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
