export type Role = "OWNER" | "ADMIN" | "MEMBER";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "TASK_COMPLETED"
  | "MESSAGE_RECEIVED"
  | "MENTION"
  | "DOCUMENT_CREATED"
  | "DOCUMENT_UPDATED"
  | "WORKSPACE_INVITE";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  inviterId: string;
  inviteeEmail: string;
  role: Role;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  inviter?: User;
  invitee?: User | null;
  workspace?: { id: string; name: string };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  members?: WorkspaceMember[];
  projects?: Project[];
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  emoji?: string | null;
  workspaceId: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: string;
  project?: Project;
  assigneeId?: string | null;
  assignee?: User | null;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  workspaceId: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  content: string;
  channelId: string;
  createdById: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string | null;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  url: string;
  publicId: string;
  mimeType: string;
  size: number;
  uploadedById: string;
  uploadedBy?: User;
  workspaceId?: string | null;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface AITask {
  id?: string;
  title: string;
  description: string;
  priority: TaskPriority;
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

