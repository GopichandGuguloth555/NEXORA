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




const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces", projectRoutes);
app.use("/api/projects", taskRoutes);
app.use("/api/tasks", commentRoutes);
app.use("/api/workspaces", channelRoutes);
app.use("/api/channels",messageRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;