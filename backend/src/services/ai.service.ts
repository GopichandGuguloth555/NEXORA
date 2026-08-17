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
Your task is to take a user's project idea and generate a complete, highly structured, production-grade project plan.

Return ONLY a valid JSON object matching this TypeScript schema, with NO markdown block formatting or surrounding text:

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

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nUSER PROJECT IDEA: ${input.prompt}` }] },
        ],
      });

      const text = response.text || "";
      const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed: AIProjectPlan = JSON.parse(cleanedJson);

      if (parsed && parsed.name && Array.isArray(parsed.phases)) {
        return parsed;
      }
    } catch (err) {
      console.warn("Gemini API call failed or unparseable, using fallback planner:", err);
    }
  }

  // Intelligent Fallback Generator for structured plans
  return fallbackPlanGenerator(input.prompt);
};

export const generateAIAssistantReply = async (input: AIAssistantInput): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are Nexora AI Assistant. Answer concisely and professionally for project planning.\nContext: ${
                  input.context || "General Workspace"
                }\nUser Question: ${input.prompt}`,
              },
            ],
          },
        ],
      });

      if (response.text) return response.text;
    } catch (err) {
      console.warn("Gemini assistant call failed:", err);
    }
  }

  // Fallback response generator
  const promptLower = input.prompt.toLowerCase();
  if (promptLower.includes("build first") || promptLower.includes("start")) {
    return "Start with Phase 1: Database Schema & Authentication setup. Once the core auth middleware and database tables are verified, proceed to building API endpoints and UI components.";
  }
  if (promptLower.includes("architecture") || promptLower.includes("structure")) {
    return "We recommend a decoupled architecture: Next.js Frontend for UI/SSR, Express/Node.js REST API backend with Prisma ORM, PostgreSQL database, and Cloudinary for file management.";
  }
  return `Nexora AI recommendation for "${input.prompt}": Break down the module into core data models, design REST endpoints, and implement UI components with loading and error boundaries.`;
};

function fallbackPlanGenerator(prompt: string): AIProjectPlan {
  const isEcommerce = /e-commerce|shop|cart|stripe|checkout|store/i.test(prompt);
  const isMobile = /mobile|app|react native|flutter|ios|android/i.test(prompt);
  const isDashboard = /dashboard|analytics|admin|saas/i.test(prompt);

  let title = "Custom Web Application";
  let tech = ["React", "Node.js", "Express", "PostgreSQL", "Tailwind CSS"];

  if (isEcommerce) {
    title = "E-Commerce Platform";
    tech = ["React", "Node.js", "PostgreSQL", "Stripe API", "Tailwind CSS", "Prisma"];
  } else if (isMobile) {
    title = "Mobile Application";
    tech = ["React Native", "Node.js", "PostgreSQL", "Express", "Expo"];
  } else if (isDashboard) {
    title = "SaaS Analytics Dashboard";
    tech = ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS", "Recharts"];
  }

  return {
    name: title,
    description: `Structured implementation plan for: "${prompt}". Designed for scalable production deployment.`,
    goals: [
      "Deliver responsive, high-performance user interface",
      "Implement secure REST APIs with JWT authentication",
      "Ensure production-grade error handling and database data integrity",
    ],
    technologies: tech,
    phases: [
      {
        name: "Phase 1: Requirements & Architecture",
        description: "Initial database design, system architecture, and project setup.",
        tasks: [
          {
            title: "Setup Repository & Workspace Architecture",
            description: "Initialize Git repository, configure TypeScript, ESLint, and environment variables.",
            priority: "HIGH",
          },
          {
            title: "Design PostgreSQL Schema & Prisma Models",
            description: "Define entity-relationship diagram for users, resources, and transactional data.",
            priority: "HIGH",
          },
          {
            title: "Implement Authentication Middleware",
            description: "Configure JWT authentication, password hashing, and authorization guards.",
            priority: "HIGH",
          },
        ],
      },
      {
        name: "Phase 2: Core Backend Service APIs",
        description: "Develop primary backend REST API controllers and business logic.",
        tasks: [
          {
            title: "Develop CRUD API Routes & Validation Schemas",
            description: "Build Express controllers and Zod validation middleware for all core resources.",
            priority: "HIGH",
          },
          {
            title: "Integrate Third-Party Services",
            description: "Configure file uploads (Cloudinary) and payment processors (Stripe) where required.",
            priority: "MEDIUM",
          },
          {
            title: "Write API Unit & Integration Tests",
            description: "Ensure endpoint coverage and error handling validation.",
            priority: "MEDIUM",
          },
        ],
      },
      {
        name: "Phase 3: Frontend Development & UI Integration",
        description: "Build user-facing web interfaces, state management, and real-time integration.",
        tasks: [
          {
            title: "Build Responsive UI Design System",
            description: "Create shared layouts, dark-mode themes, buttons, and navigation shell.",
            priority: "HIGH",
          },
          {
            title: "Connect Frontend Components to Backend APIs",
            description: "Integrate API service layer with state management and optimistic UI updates.",
            priority: "HIGH",
          },
          {
            title: "Implement Toast Notifications & Error Boundaries",
            description: "Add user feedback containers and grace failure handling.",
            priority: "MEDIUM",
          },
        ],
      },
      {
        name: "Phase 4: Deployment & Quality Assurance",
        description: "Production build validation, performance optimization, and deployment.",
        tasks: [
          {
            title: "Execute End-to-End Build Verification",
            description: "Run TypeScript checks, linters, and Next.js production bundle build.",
            priority: "HIGH",
          },
          {
            title: "Deploy Backend & Database Server",
            description: "Provision cloud environment, set environment secrets, and run database migrations.",
            priority: "HIGH",
          },
        ],
      },
    ],
    documentation: [
      {
        title: `${title} — Project Architecture Specs`,
        content: `# ${title} Architecture Overview\n\n## Overview\nThis document outlines the technical architecture and setup guidelines for ${title}.\n\n## Technology Stack\n${tech.map((t) => `- **${t}**`).join("\n")}\n\n## Core Principles\n1. Security: JWT auth & RBAC.\n2. Scalability: Decoupled client-server model.\n3. Quality: Strict TypeScript schemas.`,
      },
      {
        title: `${title} — Developer Onboarding Guide`,
        content: `# Developer Guide\n\n## Getting Started\n1. Clone repository\n2. Install dependencies: \`npm install\`\n3. Copy \`.env.example\` to \`.env\`\n4. Run database migrations\n5. Start dev server: \`npm run dev\``,
      },
    ],
  };
}
