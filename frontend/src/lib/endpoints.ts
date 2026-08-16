/**
 * Route shapes of the Express backend. Some are unusual (project and task detail
 * routes are nested under their parent router's mount point), so they live here
 * instead of being spelled out in each service.
 */
export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
  },
  workspaces: {
    root: "/workspaces",
    byId: (workspaceId: string) => `/workspaces/${workspaceId}`,
    members: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
    member: (workspaceId: string, memberId: string) =>
      `/workspaces/${workspaceId}/members/${memberId}`,
  },
  projects: {
    ofWorkspace: (workspaceId: string) => `/workspaces/${workspaceId}/projects`,
    byId: (projectId: string) => `/workspaces/projects/${projectId}`,
  },
  tasks: {
    ofProject: (projectId: string) => `/projects/${projectId}/tasks`,
    byId: (taskId: string) => `/projects/tasks/${taskId}`,
  },
  comments: {
    ofTask: (taskId: string) => `/tasks/${taskId}/comments`,
    byId: (taskId: string, commentId: string) =>
      `/tasks/${taskId}/comments/${commentId}`,
  },
  channels: {
    ofWorkspace: (workspaceId: string) => `/workspaces/${workspaceId}/channels`,
    byId: (workspaceId: string, channelId: string) =>
      `/workspaces/${workspaceId}/channels/${channelId}`,
  },
  messages: {
    ofChannel: (channelId: string) => `/channels/${channelId}/messages`,
    byId: (channelId: string, messageId: string) =>
      `/channels/${channelId}/messages/${messageId}`,
  },
  documents: {
    ofWorkspace: (workspaceId: string) => `/documents/workspaces/${workspaceId}`,
    byId: (documentId: string) => `/documents/${documentId}`,
  },
  notifications: {
    root: "/notifications",
    read: (notificationId: string) => `/notifications/${notificationId}/read`,
    byId: (notificationId: string) => `/notifications/${notificationId}`,
  },
  uploads: {
    root: "/uploads",
    byId: (fileId: string) => `/uploads/${fileId}`,
  },
} as const;
