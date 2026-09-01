import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import projectRoutes from "./routes/project.routes.js"
import taskRoutes from "./routes/task.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import messageRoutes from "./routes/message.routes.js";
import documentRoutes from "./routes/documnets.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import aiRoutes from "./routes/ai.routes.js";




const app = express();

// Support comma-separated origins in CORS_ORIGIN env var.
// Set CORS_ORIGIN on Render to include all allowed frontend origins.
const rawOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [
      "http://localhost:3000",
      // Legacy Vercel preview URL
      "https://nexora-2boh7vgtt-gopichand-guguloths-projects.vercel.app",
      // Current production Vercel URL
      "https://nexora-nine-ashy.vercel.app",
    ];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (e.g. Postman, curl, same-origin server calls)
    if (!origin) return callback(null, true);
    if (rawOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// cors middleware handles OPTIONS preflight automatically (preflightContinue defaults to false).
// Do NOT add app.options("*", ...) — Express 5 / path-to-regexp v8 rejects bare "*" wildcards.
app.use(cors(corsOptions));
app.use(express.json());

// Health check — Render pings this to confirm the service is alive
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "nexora-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces", projectRoutes);
app.use("/api/projects", taskRoutes);
app.use("/api/tasks", commentRoutes);
app.use("/api/workspaces", channelRoutes);
app.use("/api/channels", messageRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/ai", aiRoutes);

// Global error handler — must come AFTER all routes.
// Express 5 passes errors here automatically when a route throws.
// Keeping CORS headers in the error response prevents the browser
// from masking the real error as "CORS Missing Allow Origin".
app.use((err: Error & { status?: number; statusCode?: number }, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Global Error Handler]", err.name, err.message, err.stack);
  // Determine HTTP status — prefer explicit status, then fall back to 500
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;