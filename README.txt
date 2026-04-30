===============================================================
  TEAM TASK MANAGER — Full-Stack Web Application
===============================================================

LIVE URL   : https://<your-railway-app>.up.railway.app
GITHUB REPO: https://github.com/<your-username>/team-task-manager

---------------------------------------------------------------
  PROJECT OVERVIEW
---------------------------------------------------------------

Team Task Manager is a full-stack web application that allows
teams to collaborate on projects, assign tasks, and track
overall progress with role-based access control.

Key highlights:
  • JWT-based Authentication (Signup / Login)
  • Role-Based Access Control (Admin / Member)
  • Project creation and team membership management
  • Task creation, assignment, and status tracking
  • Kanban board view (To Do / In Progress / Done)
  • Dashboard with stats, progress bar, and overdue alerts
  • Fully deployed on Railway with PostgreSQL

---------------------------------------------------------------
  TECH STACK
---------------------------------------------------------------

Frontend:
  - React 19 (Vite)
  - React Router v7
  - Axios (HTTP client)
  - Lucide React (icons)
  - date-fns (date utilities)
  - Vanilla CSS with glassmorphism dark-mode design

Backend:
  - Node.js + Express 5
  - Prisma ORM
  - PostgreSQL (Railway managed database)
  - bcryptjs (password hashing)
  - jsonwebtoken (JWT auth)

Deployment:
  - Railway (monorepo: backend serves built frontend)

---------------------------------------------------------------
  PROJECT STRUCTURE
---------------------------------------------------------------

team-task-manager/
├── client/                  React frontend (Vite)
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    Auth state & API calls
│   │   ├── pages/
│   │   │   ├── Auth.jsx           Login / Signup page
│   │   │   ├── Dashboard.jsx      Overview with stats
│   │   │   └── Project.jsx        Kanban board per project
│   │   ├── api.js                 Axios instance with auth header
│   │   ├── App.jsx                Routes + sticky header
│   │   ├── index.css              Full design system
│   │   └── main.jsx
│   └── package.json
│
├── server/                  Express API
│   ├── routes/
│   │   ├── auth.js          POST /api/auth/signup, /login
│   │   ├── projects.js      CRUD + member management
│   │   └── tasks.js         CRUD tasks with access control
│   ├── middlewares/
│   │   └── auth.js          JWT verify + role check
│   ├── prisma.js            Prisma client singleton
│   └── index.js             App entry point
│
├── prisma/
│   └── schema.prisma        Database schema
│
├── package.json             Root – runs backend, builds frontend
├── nixpacks.toml            Railway build config
├── railway.json             Railway deploy config
└── README.txt               This file

---------------------------------------------------------------
  DATABASE SCHEMA
---------------------------------------------------------------

User
  id, name, email (unique), password (hashed), role (ADMIN|MEMBER)

Project
  id, name, description, ownerId → User

ProjectMember
  userId → User, projectId → Project, role (ADMIN|MEMBER)
  unique(userId, projectId)

Task
  id, title, description, status (TODO|IN_PROGRESS|DONE),
  dueDate, projectId → Project, assigneeId → User (optional)

---------------------------------------------------------------
  REST API ENDPOINTS
---------------------------------------------------------------

AUTH
  POST  /api/auth/signup    Register new user
  POST  /api/auth/login     Login, returns JWT

PROJECTS  (all require Bearer token)
  GET   /api/projects             List user's projects
  POST  /api/projects             Create project
  GET   /api/projects/:id         Project details + tasks + members
  POST  /api/projects/:id/members Add member by email

TASKS  (all require Bearer token)
  GET   /api/tasks                List tasks in user's projects
  POST  /api/tasks                Create task
  PUT   /api/tasks/:id            Update task (status, assignee, …)
  DELETE /api/tasks/:id           Delete task

---------------------------------------------------------------
  LOCAL DEVELOPMENT SETUP
---------------------------------------------------------------

Prerequisites: Node.js ≥20, PostgreSQL (or use the SQLite dev.db)

1. Clone the repository
   git clone https://github.com/<your-username>/team-task-manager
   cd team-task-manager

2. Install dependencies
   npm install           (root / backend)
   cd client && npm install && cd ..

3. Configure environment
   Create a .env file in the root:

     DATABASE_URL="postgresql://user:pass@localhost:5432/taskmanager"
     JWT_SECRET="your-super-secret-key"

   For SQLite during local dev you can use:
     DATABASE_URL="file:./dev.db"
   (change provider in prisma/schema.prisma to "sqlite")

4. Push schema to database
   npx prisma db push

5. Start backend (port 3000)
   npm run dev

6. Start frontend dev server (port 5173)
   cd client && npm run dev

   The frontend proxies /api → localhost:3000 via vite.config.js.

---------------------------------------------------------------
  DEPLOYMENT ON RAILWAY
---------------------------------------------------------------

1. Push code to GitHub.
2. Create a new Railway project → "Deploy from GitHub repo".
3. Add a PostgreSQL plugin (Railway dashboard → + New → Database).
4. Copy the DATABASE_URL from the PostgreSQL plugin into
   the web service's environment variables.
5. Add JWT_SECRET to the web service env vars.
6. Railway will run:
     npm install && npm run build   (installs & builds React)
     npm start                      (node server/index.js)
7. The backend serves the built React app as static files, so
   one Railway service handles both frontend and backend.
8. Your live URL appears in the Railway service panel.

Required env vars on Railway:
  DATABASE_URL   (auto-linked from PostgreSQL plugin)
  JWT_SECRET     (any random string)

---------------------------------------------------------------
  ROLE-BASED ACCESS CONTROL
---------------------------------------------------------------

ADMIN role:
  - Can create projects (becomes owner)
  - Can invite / add members to their projects
  - Can delete tasks within their projects

MEMBER role:
  - Can view projects they belong to
  - Can create and update tasks within those projects
  - Cannot add or remove members

Ownership check logic:
  When creating a project, the authenticated user is set as
  owner and automatically added as an ADMIN member.
  Any route that mutates team membership checks:
    project.ownerId === req.user.id  OR  projectMember.role === ADMIN

---------------------------------------------------------------
  FEATURES IN DETAIL
---------------------------------------------------------------

Dashboard:
  - Stat cards: Total Projects, Total Tasks, In Progress,
    Completed, Overdue
  - Visual progress bar (% of tasks done)
  - Project list with quick navigation
  - Task list with status badges and overdue highlight

Project Page (Kanban):
  - Three columns: To Do / In Progress / Done
  - Drag-free status update via inline dropdown
  - Per-card: assignee avatar, due date, overdue warning
  - Delete task (admin/owner only)
  - Team sidebar with member avatars and roles
  - Invite member modal

Authentication:
  - Signup with name, email, password, role
  - Login with JWT stored in localStorage
  - Password show/hide toggle
  - Auto-redirect for protected routes

---------------------------------------------------------------
  SUBMISSION CHECKLIST
---------------------------------------------------------------

  [x] Authentication (Signup / Login) with JWT
  [x] Role-based access control (Admin / Member)
  [x] Project creation and team management
  [x] Task creation, assignment, and status tracking
  [x] Dashboard with stats and overdue tracking
  [x] REST API with proper validations
  [x] PostgreSQL database with Prisma ORM
  [x] Deployed on Railway (live URL above)
  [x] GitHub repository
  [x] README.txt

---------------------------------------------------------------
  LICENSE
---------------------------------------------------------------

MIT License — free to use, modify, and distribute.

===============================================================
