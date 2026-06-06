import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Initialize server-side Gemini client
  // Make sure GEMINI_API_KEY is supplied
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "placeholder_if_missing",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Reframe thought API using the standard gemini-3.5-flash model for basic text and reasoning tasks
  app.post("/api/reframe", async (req, res) => {
    try {
      const { situation, negativeThought, distortions, context } = req.body;
      if (!negativeThought) {
        return res.status(400).json({ error: "Negative thought is required." });
      }

      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured. Please add your key in Settings > Secrets to enable AI-guided CBT features."
        });
      }

      const prompt = `
You are a highly compassionate, rational, and professional Cognitive Behavioral Therapy (CBT) therapist. Your goal is to guide the user in reframing their negative automatic thought.

User Context/Setting: ${context || 'general'}
Situation description: "${situation || 'unspecified circumstances'}"
Automatic Negative Thought (ANT): "${negativeThought}"
Distortions identified by the user: ${distortions && distortions.length ? distortions.join(", ") : "Not specified"}

Please provide a structured, helpful, and empathetic therapeutic response. You should:
1. Validate their feelings briefly with deep warmth and compassion (stating that commute or workplace stress is highly normal and exhausting, yet manageable).
2. Deconstruct the negative thoughts objectively. Factual analysis of the thought: point out any patterns of thinking errors (like Catastrophizing, All-or-Nothing, Mind Reading, or Overgeneralizing) that may be heightening their stress.
3. Formulate three direct, realistic, and positive alternative thoughts or reframes they can adopt and repeat to themselves right now.
4. Suggest one simple, sensory mindfulness action they can perform immediately (e.g., during their current commute or sitting at their desk step-by-step).

Format your response as a valid JSON object matching this exact TypeScript structure:
{
  "empathy": "string",
  "deconstruction": "string",
  "reframes": ["string", "string", "string"],
  "microAction": "string"
}

Your output must be strictly valid JSON and nothing else. Do not wrap the JSON output in markdown (do not use \`\`\`json block). Just return the raw JSON text.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.9,
        }
      });

      const responseText = response.text || "{}";
      const cleanedText = responseText.trim();
      
      try {
        const parsed = JSON.parse(cleanedText);
        return res.json(parsed);
      } catch (jsonErr) {
        console.error("Failed to parse JSON response from Gemini:", cleanedText);
        
        // Simple fallback parsing if markdown tags were returned anyway
        let stripped = cleanedText;
        if (cleanedText.startsWith("```")) {
          // find starting of json and ending of json
          const firstBrace = cleanedText.indexOf("{");
          const lastBrace = cleanedText.indexOf("}");
          if (firstBrace !== -1 && lastBrace !== -1) {
            stripped = cleanedText.substring(firstBrace, lastBrace + 1);
          }
        }
        
        try {
          const parsedStripped = JSON.parse(stripped);
          return res.json(parsedStripped);
        } catch (_) {
          // Core backup structured message if parsing still fails
          return res.json({
            empathy: "I hear how difficult and exhausting this is for you. Commuting and work pressure can feel incredibly intense.",
            deconstruction: "Your core reaction of frustration or defeat is understandable, but sometimes automatic thoughts blow temporary setbacks out of proportion.",
            reframes: [
              "This situation is challenging, but I have handled things like this before and will get through it.",
              "I cannot control this external situation, but I can control how I respond internally.",
              "This delay or difficulty does not define my ability or my entire day."
            ],
            microAction: "Practice the 5-4-3-2-1 grounding method right now: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste to return to the present."
          });
        }
      }

    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: err.message || "An error occurred with the AI CBT server." });
    }
  });

  // Vite integration
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
