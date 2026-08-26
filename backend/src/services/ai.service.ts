import { GoogleGenAI } from "@google/genai";
import type { GeneratePlanInput, AIAssistantInput } from "../validations/ai.schema.js";

export interface AITask {
  id?: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface AIPhase {
  name: string;
  description: string;
  tasks: AITask[];
}

export interface AIDocumentation {
  title: string;
  content: string;
}

export interface AIProjectPlan {
  name: string;
  description: string;
  goals: string[];
  technologies: string[];
  phases: AIPhase[];
  documentation: AIDocumentation[];
}

const SYSTEM_PROMPT = `
You are Nexora AI, a world-class principal software architect and project manager.
Your task is to take a user's project idea and generate a complete, highly structured, production-grade project plan tailored SPECIFICALLY to their idea.
Do not return a generic plan. Always return a specific, customized plan matching the user's prompt.

Return ONLY a valid JSON object matching this schema:

{
  "name": "Short Project Title",
  "description": "2-3 sentence project summary",
  "goals": ["Goal 1", "Goal 2", "Goal 3"],
  "technologies": ["React", "Node.js", "PostgreSQL", ...],
  "phases": [
    {
      "name": "Phase 1: Planning & Setup",
      "description": "Phase summary",
      "tasks": [
        {
          "title": "Task title",
          "description": "Task details",
          "priority": "HIGH" | "MEDIUM" | "LOW"
        }
      ]
    }
  ],
  "documentation": [
    {
      "title": "Project Architecture Overview",
      "content": "Detailed markdown content..."
    },
    {
      "title": "API & Database Specifications",
      "content": "Detailed markdown content..."
    }
  ]
}
`;

export const generateAIProjectPlan = async (input: GeneratePlanInput): Promise<AIProjectPlan> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("AI generation failed: GEMINI_API_KEY is not configured in the environment.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nUSER PROJECT IDEA: ${input.prompt}` }] },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    let cleanedJson = text.trim();
    if (cleanedJson.startsWith("\`\`\`json")) {
      cleanedJson = cleanedJson.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "");
    } else if (cleanedJson.startsWith("\`\`\`")) {
      cleanedJson = cleanedJson.replace(/^\`\`\`\n?/, "").replace(/\n?\`\`\`$/, "");
    }
    
    const parsed: AIProjectPlan = JSON.parse(cleanedJson);

    if (!parsed || !parsed.name || !Array.isArray(parsed.phases)) {
      throw new Error("AI returned malformed or incomplete project data.");
    }

    return parsed;
  } catch (err: any) {
    console.error("Gemini API call failed:", err);
    throw new Error(err.message || "Failed to generate project plan from AI provider.");
  }
};

export const generateAIAssistantReply = async (input: AIAssistantInput): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("AI assistant failed: GEMINI_API_KEY is not configured.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are Nexora AI Assistant. Answer concisely and professionally for project planning.\nContext (Current Project): ${
                input.context || "General Workspace"
              }\nUser Question: ${input.prompt}`,
            },
          ],
        },
      ],
    });

    if (response.text) return response.text;
    throw new Error("AI returned an empty response.");
  } catch (err: any) {
    console.error("Gemini assistant call failed:", err);
    throw new Error(err.message || "Failed to generate assistant response from AI provider.");
  }
};
