# 🚀 Nexora — All-in-One Project Planning & Team Collaboration Platform

Nexora is a full-stack, enterprise-ready team collaboration software that unifies **AI Project Planning**, **Project & Task Management (Kanban)**, **Real-Time Team Channels (Socket.IO)**, **Notifications**, **Workspace Documentation**, and **Cloudinary File Management** into a single SaaS application.

---

## 🌟 Product Vision & Features

1. **Authentication & Security**
   - JWT-based authentication with access and refresh tokens.
   - User registration, login, logout, and protected client-side routes.
   - Password hashing with `bcrypt` and Zod input validation.

2. **Workspace Isolation & Team Management**
   - Multi-tenant workspace architecture.
   - Switch active workspace seamlessly; all projects, tasks, channels, documents, and files are isolated per workspace.
   - Workspace member invitations and owner/admin/member roles.

3. **Project & Task Management**
   - Workspace-scoped projects with custom emojis, descriptions, and creator tracking.
   - Full task management: `TODO`, `IN_PROGRESS`, `DONE` statuses.
   - Priority indicators (`LOW`, `MEDIUM`, `HIGH`), due dates, and member assignments.
   - Inline task comments stream.

4. **Real-Time Team Channels & Chat (Socket.IO)**
   - Channel creation per workspace (e.g. `#general`, `#engineering`, `#announcements`).
   - Real-time message streaming with Socket.IO channels.
   - Sender identification, timestamps, active typing indicators (`user-typing`), and message deletion.

5. **Notification System & Unread Tracking**
   - Real-time notification drawer with unread count badge.
   - Automatic triggers for task assignments, updates, and workspace activities.
   - Single item *"Mark as Read"*, *"Mark All as Read"*, and notification deletion.

6. **Workspace Documentation Engine**
   - Structured workspace wiki and document knowledge base.
   - In-app markdown editor with live editing, creator metadata, and timestamps.
   - Search bar filter by document title or author.

7. **Cloudinary File Storage & Asset Manager**
   - Multipart file upload supporting **JPG, JPEG, PNG, and PDF** files up to **5 MB**.
   - Cloudinary integration returning secure URLs.
   - Image thumbnail previews, PDF badges, file size display, and external open links.

8. **AI-Powered Project Planning & Documentation**
   - Describe a product goal (e.g. *"Build an e-commerce platform with React, Node.js, PostgreSQL and Stripe"*).
   - Generates a structured project plan with goals, tech stack, phases, tasks, priorities, and technical documentation.
   - **Review & Edit Screen**: Modify tasks before creation.
   - **Real Database Sync**: Clicking **"Create Project"** generates the project and tasks in the real database.
   - **Save Documentation**: Saves technical specifications to the workspace Documents section.

---

## 🏗️ Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS + Tailwind CSS utilities, Lucide Icons, Socket.IO Client, Axios.
* **Backend**: Node.js, Express 5, TypeScript, Socket.IO Server, Multer (Memory Storage), Zod.
* **Database & ORM**: PostgreSQL, Prisma ORM.
* **Storage & AI**: Cloudinary API, Google Gen AI SDK (`@google/genai`).

---

## 🛠️ Environment Variables Configuration

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nexora?schema=public"
PORT=5000
JWT_SECRET=your_jwt_super_secret_key
JWT_EXPIRES_IN=60m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
REFRESH_TOKEN_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database running locally or remotely

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx prisma generate
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend web application runs on `http://localhost:3000`.

---

## 🧪 Production Verification & Build
To build the application for production deployment:

```bash
# Verify Frontend Production Build
cd frontend
npm run build
```

---

## 📝 License & Version
Nexora SaaS Platform V1.0.0 — Licensed under ISC.
