import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Initialize GoogleGenAI server-side with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Robust model query helper with retry and fallback
async function generateContentWithRetry(contents: any[], systemInstruction: string) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  const maxRetriesPerModel = 2;
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log(`[Gemini API] Querying model ${model} (attempt ${attempt}/${maxRetriesPerModel})...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.75,
          },
        });
        if (response && response.text) {
          console.log(`[Gemini API] Successfully received response from ${model}`);
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API Warning] ${model} attempt ${attempt} failed:`, err.message || err);
        
        if (attempt < maxRetriesPerModel) {
          // Exponential-like backoff delay before retrying the same model
          const delay = attempt * 1200;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    console.warn(`[Gemini API Warning] Model ${model} exhausted. Switching to fallback model if available...`);
  }

  throw lastError || new Error("Failed to generate content from all attempted Gemini models.");
}

app.use(express.json());

// API: Techie Bot Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Format history into GoogleGenAI content schema
    // Roles must be 'user' and 'model'
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      });
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Techie's Cybernetic System Instruction
    const systemInstruction = `You are "Techie", a futuristic, sleek, cybernetic AI assistant embedded inside the "CodeRadar" dashboard.
Your purpose is to:
1. Help users use the CodeRadar application. Highlight features:
   - Modern Navbar: Access credentials, search, choose themes (Cyan, Pink, Green), and toggle personal tracked dashboards.
   - 3D Contribution Cube (Voxel View): Visualizes weekly contribution zones. Hovering previews coordinates/stats, and clicking on a voxel locks its stats in place!
   - Profile Details Panel: Displays bios, tracker controls, follower grids, top repos, language distribution charts, and streak stats.
   - Heatmap Preview: A high-density 2D git heatmap.
   - Live Activity Feed: Typewriter terminal showing simulated security scanning protocols for profiles.
2. Answer questions about software engineering, GitHub workflows, Git commands, or programming languages.
3. Help users improve their GitHub profile. Give specific, highly actionable tips on:
   - Creating gorgeous Profile READMEs with custom badges or widgets.
   - Pinning repositories that show off architectural skills instead of random scratchpads.
   - Building consistent contribution streaks.
   - Polishing codebase documentation and licenses.

Keep your tone friendly, incredibly knowledgeable, cybernetic, and clear. Format all answers elegantly using Markdown (including tables, bullets, and bold key terms) to match CodeRadar's premium developer aesthetic.`;

    // Query Gemini with automatic retry and model fallback
    const response = await generateContentWithRetry(contents, systemInstruction);

    const reply = response.text || "No connection established. System secure.";
    res.json({ reply });
  } catch (err: any) {
    console.error("Techie communication failure:", err);
    res.status(500).json({
      error: "Techie offline. Check system secrets or API configuration.",
      details: err.message,
    });
  }
});

// Start the server (Dev & Prod)
async function startServer() {
  // Vite dev middleware for assets
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static assets in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CodeRadar Full-Stack] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
