# 🚀 NEXORA — AI-Powered Collaborative Workspace

<p align="center">
  <strong>One Workspace. Every Workflow. Smarter Collaboration.</strong>
  <br />
  A full-stack collaboration platform designed to bring teams, projects, tasks, communication, documents, and AI assistance together in one place.
  <br /><br />
  <a href="https://github.com/GopichandGuguloth555/NEXORA">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository" />
  </a>
  <a href="https://github.com/GopichandGuguloth555/NEXORA">
    <img src="https://img.shields.io/badge/Project-NEXORA-6366F1?style=for-the-badge" alt="Nexora" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

---

## 📌 Overview

**NEXORA** is a collaborative workspace platform that brings essential team productivity tools into a unified application.

Instead of switching between multiple applications to manage projects, track tasks, communicate with teammates, organize documents, and access AI assistance, Nexora aims to provide a centralized workspace for these activities.

The platform combines a modern web interface, a TypeScript backend, a relational database, real-time communication, cloud file storage, and AI integration.

## ✨ Key Features

### 👥 Workspace Management
- Organize collaboration around workspaces.
- Manage workspace members and invitations.
- Keep team activities and resources in one place.

### 📊 Project Management
- Create and manage projects.
- Organize project work and track tasks.
- Access project-specific information and team resources.

### ✅ Task Management
- Create and organize tasks.
- Track task status and progress.
- Associate tasks with projects and workspaces.

### 💬 Real-Time Communication
- Communicate through workspace channels.
- Support real-time messaging using Socket.IO.
- Keep conversations connected to team collaboration.

### 📁 Documents and File Management
- Organize workspace documents.
- Upload and manage files using Cloudinary integration.
- Make shared resources easier to access.

### 🤖 AI Assistance
- Integrate Google's Gemini models for AI-powered functionality.
- Provide a dedicated AI interface.
- Build AI-assisted workflows into the collaborative workspace.

### 🔔 Notifications
- Provide a centralized notification interface.
- Keep users informed about relevant workspace activity.

### 🔐 Authentication and Security
- JWT-based authentication.
- Password hashing with bcrypt.
- Google OAuth integration.
- Protected backend endpoints and authenticated user workflows.

*Feature availability depends on the current implementation and configuration of the application.*

---

## 🏗️ System Architecture

Nexora uses a full-stack architecture with a Next.js frontend, a Node.js and Express backend, PostgreSQL for persistent storage, and supporting services for real-time communication, authentication, file storage, and AI functionality.

### High-Level Architecture

```mermaid
flowchart TB
    USER(["👤 User"])

    subgraph FRONTEND["Frontend Layer"]
        NEXT["Next.js App Router"]
        REACT["React + TypeScript"]
        TAILWIND["Tailwind CSS"]
        AXIOS["Axios API Client"]
        NEXT --> REACT
        REACT --> TAILWIND
        REACT --> AXIOS
    end

    subgraph BACKEND["Backend Layer"]
        API["Express REST API"]
        AUTH["Authentication Middleware"]
        ROUTES["Routes & Controllers"]
        SERVICES["Business Logic Services"]
        SOCKET["Socket.IO Server"]
    end

    subgraph DATABASE["Data Layer"]
        PRISMA["Prisma ORM"]
        DB[("PostgreSQL")]
    end

    subgraph EXTERNAL["External Services"]
        GOOGLE["Google OAuth"]
        CLOUDINARY["Cloudinary Storage"]
        GEMINI["Google Gemini AI"]
    end

    USER <--> NEXT
    AXIOS <-->|"HTTP / JSON"| API
    API --> AUTH
    AUTH --> ROUTES
    ROUTES --> SERVICES
    SERVICES <--> PRISMA
    PRISMA <--> DB

    REACT <-->|"Real-Time Events"| SOCKET
    SOCKET <--> SERVICES

    SERVICES <--> GOOGLE
    SERVICES <--> CLOUDINARY
    SERVICES <--> GEMINI

    classDef frontend fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef backend fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef database fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef external fill:#f3e8ff,stroke:#9333ea,color:#581c87

    class NEXT,REACT,TAILWIND,AXIOS frontend
    class API,AUTH,ROUTES,SERVICES,SOCKET backend
    class PRISMA,DB database
    class GOOGLE,CLOUDINARY,GEMINI external
```

### 🔄 Request and Data Flow

1. **Frontend:** Users interact with the Next.js application to manage their workspace, projects, tasks, documents, and conversations.
2. **API communication:** Axios sends HTTP requests to the Express backend.
3. **Authentication:** Middleware validates credentials and protects authenticated endpoints.
4. **Business logic:** Routes, controllers, and services process application operations.
5. **Database access:** Prisma communicates with PostgreSQL to read and persist application data.
6. **Real-time updates:** Socket.IO supports event-based communication between connected clients and the server.
7. **External integrations:** The backend integrates with Google OAuth, Cloudinary, and Gemini where required.
8. **Response:** The frontend receives API responses or real-time events and updates the relevant interface.

---

## 🔐 Authentication Architecture

```mermaid
sequenceDiagram
    actor User
    participant UI as Next.js Frontend
    participant API as Express Backend
    participant Auth as Auth Middleware
    participant DB as PostgreSQL

    User->>UI: Sign in
    UI->>API: Submit credentials
    API->>DB: Retrieve user
    DB-->>API: User record
    API->>API: Verify password with bcrypt
    API-->>UI: Authentication response

    User->>UI: Access protected resource
    UI->>API: Authenticated API request
    API->>Auth: Validate credentials or JWT
    Auth-->>API: Authentication result
    API->>DB: Read or update authorized data
    DB-->>API: Query result
    API-->>UI: JSON response
    UI-->>User: Display updated workspace
```

The exact credential delivery, token storage, and session flow should match the implementation in the repository.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| Frontend Framework | Next.js 16 | Web application and App Router |
| UI Library | React 19 | Component-based interface |
| Language | TypeScript | Type-safe development |
| Styling | Tailwind CSS 4 | Responsive UI styling |
| API Client | Axios | HTTP communication |
| Backend Runtime | Node.js | Server-side execution |
| Backend Framework | Express 5 | REST API and routing |
| Database | PostgreSQL | Relational data persistence |
| ORM | Prisma 7 | Database access and schema management |
| Authentication | JWT, bcrypt | Authentication and password hashing |
| Real-Time Communication | Socket.IO | Event-based messaging |
| File Storage | Cloudinary | Cloud media and file management |
| AI Integration | Google Gemini | AI-powered functionality |
| OAuth | Google OAuth | Third-party authentication |
| Icons | Lucide | Interface icons |
| Version Control | Git, GitHub | Source control and collaboration |

---

## 📂 Project Structure

The following structure represents the main application areas. Actual filenames and directories may differ slightly from the repository.

```text
NEXORA/
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   └── app/
│   │       ├── ai/
│   │       ├── chat/
│   │       ├── dashboard/
│   │       ├── documents/
│   │       ├── files/
│   │       ├── members/
│   │       ├── notifications/
│   │       ├── projects/
│   │       └── tasks/
│   ├── components/
│   ├── contexts/
│   │   ├── AuthContext
│   │   ├── SocketContext
│   │   └── WorkspaceContext
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   ├── workspace/
│   │   ├── project/
│   │   ├── task/
│   │   ├── channel/
│   │   ├── message/
│   │   ├── document/
│   │   ├── notification/
│   │   ├── upload/
│   │   ├── ai/
│   │   ├── middleware/
│   │   ├── validations/
│   │   └── sockets/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🗄️ Database Design

Nexora uses PostgreSQL with Prisma for relational data management.

The data model includes the following core entities:

| Entity | Responsibility |
|---|---|
| Users | User accounts and identity |
| Workspaces | Team collaboration spaces |
| Projects | Projects within a workspace |
| Tasks | Trackable units of work |
| Channels | Workspace communication channels |
| Messages | Channel conversations |
| Documents | Structured workspace documents |
| Files | Uploaded file metadata |
| Notifications | User notifications |
| Invitations | Workspace invitation workflows |

### Simplified Entity Relationships

```mermaid
erDiagram
    USER ||--o{ WORKSPACE : creates
    WORKSPACE ||--o{ PROJECT : contains
    WORKSPACE ||--o{ TASK : organizes
    WORKSPACE ||--o{ CHANNEL : provides
    CHANNEL ||--o{ MESSAGE : contains
    PROJECT ||--o{ TASK : tracks
    WORKSPACE ||--o{ DOCUMENT : stores
    WORKSPACE ||--o{ FILE : organizes
    USER ||--o{ NOTIFICATION : receives
    WORKSPACE ||--o{ INVITATION : manages
```

*This is a conceptual overview. The precise foreign keys, membership relationships, and cardinalities are defined by the actual Prisma schema.*

---

## 💻 Installation and Local Setup

Follow these steps to run Nexora locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) — use a version compatible with your dependencies.
- npm.
- [Git](https://git-scm.com/).
- A PostgreSQL database, either local or hosted.
- Google OAuth credentials, if using Google sign-in.
- Cloudinary credentials, if using file uploads.
- A Google Gemini API key, if using AI features.

Verify your tools:

```bash
node --version
npm --version
git --version
```

### 1. Fork the Repository

Open the Nexora GitHub repository and click **Fork** to create your own copy.

**Repository:** [GopichandGuguloth555/NEXORA](https://github.com/GopichandGuguloth555/NEXORA)

### 2. Clone Your Fork

Replace `YOUR_GITHUB_USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/NEXORA.git
cd NEXORA
```

If you only want to run the original project locally, clone the original repository instead.

### 3. Install Backend Dependencies

Open a terminal in the repository root:

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory.

The following is a template. Use the exact variable names required by your source code.

```env
PORT=3000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key

FRONTEND_URL=http://localhost:3001
```

**Important:**

- Replace placeholders with your own credentials.
- Do not commit `.env` files or secrets to GitHub.
- Remove or omit variables for integrations that your application does not require.
- Verify the expected port and environment variable names in the backend source code.

### 5. Configure PostgreSQL

Create a PostgreSQL database locally or provision a hosted PostgreSQL database.

Set the connection string in `DATABASE_URL`.

Example format:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"
```

Replace the placeholders with your actual database credentials and database name.

### 6. Set Up Prisma

From the backend directory, inspect the Prisma scripts and configuration.

For a standard Prisma project, the commands may look like:

```bash
npx prisma generate
npx prisma migrate dev
```

Use the migration workflow supported by the repository. If the project already contains migrations or uses a different Prisma configuration, follow the existing setup instructions instead.

### 7. Start the Backend

The backend provides build and start scripts:

```bash
npm run build
npm start
```

The build command compiles TypeScript, and the start command runs the compiled server.

Keep the terminal running while using the application.

### 8. Install Frontend Dependencies

Open a second terminal and navigate to the frontend directory.

If your repository uses a `frontend/` directory:

```bash
cd frontend
npm install
```

Create a frontend `.env.local` file if needed.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Use the actual environment variable referenced by the frontend code.

### 9. Run the Frontend

From the frontend directory:

```bash
npm run dev
```

Open the URL displayed in the terminal. For a typical Next.js configuration, this is:

**http://localhost:3000**

If the backend uses the same port, configure the two services to use different ports. For example, run the backend on port `4000` and configure the frontend API URL accordingly.

### Local Development Checklist

- [ ] Backend dependencies installed.
- [ ] Environment variables configured.
- [ ] PostgreSQL database accessible.
- [ ] Prisma client generated and database migrations applied.
- [ ] Backend started successfully.
- [ ] Frontend dependencies installed.
- [ ] Frontend API URL configured.
- [ ] Frontend started successfully.
- [ ] Authentication and required integrations tested.

---

## 🌐 Deployment Architecture

A possible production deployment arrangement is:

```mermaid
flowchart LR
    G["GitHub Repository"]
    F["Vercel Frontend"]
    B["Render Backend"]
    DB[("PostgreSQL Database")]
    C["Cloudinary"]
    AI["Google Gemini"]

    G --> F
    G --> B
    F <-->|"HTTPS / API"| B
    B <--> DB
    B <--> C
    B <--> AI
```

### Deployment Checklist

1. Deploy the frontend to Vercel.
2. Deploy the backend to Render or another compatible hosting provider.
3. Provision PostgreSQL and configure the production database connection.
4. Set production environment variables in each hosting dashboard.
5. Configure CORS for the production frontend domain.
6. Configure Google OAuth redirect URIs.
7. Verify database migrations and Prisma client generation.
8. Test authentication, file uploads, AI functionality, and real-time communication.

The diagram illustrates a deployment option, not a claim that every service is currently deployed or operational.

---

## 🔒 Security Considerations

- Keep API keys, database credentials, and JWT secrets private.
- Hash passwords securely with bcrypt.
- Validate authentication and authorization on protected endpoints.
- Verify workspace membership and resource ownership before returning private data.
- Validate file uploads and restrict permitted file types and sizes.
- Configure CORS with trusted origins.
- Avoid exposing sensitive user data in logs or API responses.
- Protect AI integrations from unauthorized access and excessive usage.
- Use HTTPS in production.
- Never commit environment files containing secrets.

---

## 🔮 Future Enhancements

Potential directions for future development include:

- 🧠 Context-aware AI assistance across projects and documents.
- 📋 AI-generated task summaries and project updates.
- 🔎 Semantic search across workspace knowledge.
- 📊 Project analytics and productivity insights.
- ⚡ More comprehensive real-time collaboration.
- 🗓️ Calendar integration and workflow automation.
- 🔔 Configurable notification preferences.
- 🧪 Expanded automated testing and observability.

These are possible future improvements, not a statement that they have already been implemented.

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome!

### How to Contribute

1. Fork the repository.
2. Clone your fork.
3. Create a branch for your change.
4. Implement and test your changes.
5. Commit and push your work.
6. Open a Pull Request against the original repository.

### Contribution Commands

```bash
# Clone your fork
git clone https://github.com/YOUR_GITHUB_USERNAME/NEXORA.git

# Enter the project
cd NEXORA

# Create a feature branch
git checkout -b feature/your-feature-name

# Make and test your changes

# Stage your changes
git add .

# Commit your changes
git commit -m "feat: describe your changes"

# Push the branch
git push origin feature/your-feature-name
```

After pushing your branch, open your fork on GitHub and click **Compare & pull request** to submit your contribution.

Please provide a clear description of your changes and include testing details where appropriate.

---

## 🐛 Issues and Bug Reports

Found a bug or want to propose a feature?

- Open an issue in the [Nexora repository](https://github.com/GopichandGuguloth555/NEXORA).
- Explain the problem or proposed improvement.
- Include reproduction steps and relevant error messages.
- Never include passwords, API keys, or other private credentials in issue reports.

---

## 📄 License

Check the repository for its existing license before redistributing or reusing the code. If no license is present, contact the repository owner for permission.

---

## 👨‍💻 Author

**Gopichand**

B.Tech Computer Science Student  
Full-Stack Development | AI Engineering | Generative AI

GitHub: [@GopichandGuguloth555](https://github.com/GopichandGuguloth555)

---

<p align="center">
  <strong>🚀 NEXORA — Bringing Teams, Projects, and AI Together.</strong>
  <br /><br />
  <a href="https://github.com/GopichandGuguloth555/NEXORA">Explore the Repository</a>
</p>
