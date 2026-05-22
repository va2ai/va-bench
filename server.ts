import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client inside the API endpoint to avoid crashes on startup if key is missing
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please add it via the Settings > Secrets tab in Google AI Studio.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// 2. Primary agent execution endpoint
app.post("/api/run-agent", async (req, res) => {
  try {
    const { agentId, agentName, systemPrompt, inputText, useProModel } = req.body;

    if (!systemPrompt || !inputText) {
      return res.status(400).json({
        error: "Missing required parameters: systemPrompt and inputText are required.",
      });
    }

    // Lazy init
    let ai;
    try {
      ai = getGeminiClient();
    } catch (keyErr: any) {
      return res.status(401).json({
        error: keyErr.message || "Missing GEMINI_API_KEY secret.",
        needsConfig: true,
      });
    }

    // Select suitable model: gemini-3.5-flash of first preference, or gemini-3.1-pro-preview for pro
    const modelToUse = useProModel ? "gemini-3.1-pro-preview" : "gemini-3.5-flash";

    console.log(`[Agent Hub] Running agent: ${agentName || agentId} utilizing model: ${modelToUse}...`);

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: inputText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1, // Keep analysis focused and deterministic
      },
    });

    const resultText = response.text;
    res.json({
      success: true,
      modelUsed: modelToUse,
      outputText: resultText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Agent Hub Error] Error invoking Gemini:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred during agent analysis.",
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
  }
});

// Configure Vite or Serve Static Assets
async function startServer() {
  if (process.env.DISABLE_HMR === "true" || process.env.NODE_ENV === "production") {
    // Production Mode: Serve built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Development Mode: Mount Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Agent Hub Server] Fullstack listening on port http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Agent Hub server:", err);
});
