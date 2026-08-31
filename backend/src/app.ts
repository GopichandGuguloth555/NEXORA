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

// Support comma-separated origins in CORS_ORIGIN env var, e.g.:
// CORS_ORIGIN=http://localhost:3000,https://nexora-2boh7vgtt-gopichand-guguloths-projects.vercel.app
const rawOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [
      "http://localhost:3000",
      "https://nexora-2boh7vgtt-gopichand-guguloths-projects.vercel.app",
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

app.use(cors(corsOptions));
// Explicitly handle OPTIONS preflight for all routes
app.options("*", cors(corsOptions));
app.use(express.json());

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

export default app;