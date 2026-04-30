# Team Task Manager

A full-stack web application for project and task management with role-based access control (Admin/Member), built with React, Node.js/Express, Prisma ORM, and PostgreSQL.

## 🌐 Live URL

**https://team-task-manager-web-production.up.railway.app**

## 📁 GitHub Repository

**https://github.com/Mahak-12agrawal/team-task-manager**

---

## 🚀 Features

- **Authentication** — Secure Signup & Login with JWT tokens
- **Role-Based Access Control** — Admin and Member roles per project
- **Project Management** — Create projects, add/manage team members
- **Task Management** — Create, assign, update, and track tasks
- **Task Status Tracking** — TODO, IN_PROGRESS, DONE statuses
- **Dashboard** — Overview of all projects, tasks, and overdue items
- **Overdue Detection** — Automatically highlights tasks past their due date

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 19, Vite, React Router v7   |
| Styling    | Vanilla CSS (glassmorphism design)|
| Backend    | Node.js, Express v5               |
| Database   | PostgreSQL (via Railway)          |
| ORM        | Prisma v5                         |
| Auth       | JSON Web Tokens (JWT), bcryptjs   |
| Deployment | Railway                           |

---

## 📦 Project Structure

```
team-task-manager/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── pages/           # Auth, Dashboard, Project pages
│       ├── context/         # AuthContext (global auth state)
│       ├── api.js           # Axios instance with JWT interceptor
│       └── index.css        # Global styles
├── server/                  # Express backend
│   ├── routes/
│   │   ├── auth.js          # POST /api/auth/signup, /login
│   │   ├── projects.js      # CRUD for projects + members
│   │   └── tasks.js         # CRUD for tasks
│   ├── middlewares/
│   │   └── auth.js          # JWT authentication middleware
│   ├── prisma.js            # Shared Prisma client instance
│   └── index.js             # Express app entry point
├── prisma/
│   └── schema.prisma        # Database schema (User, Project, Task)
├── railway.json             # Railway deployment config
├── nixpacks.toml            # Nixpacks build config (Node 20)
└── README.md
```

---

## 🗄️ Database Schema

- **User** — id, name, email, password (hashed), role (ADMIN/MEMBER)
- **Project** — id, name, description, ownerId
- **ProjectMember** — userId, projectId, role (ADMIN/MEMBER)
- **Task** — id, title, description, status, dueDate, projectId, assigneeId

---

## ⚙️ REST API Endpoints

### Auth
| Method | Endpoint              | Description     |
|--------|-----------------------|-----------------|
| POST   | `/api/auth/signup`    | Register user   |
| POST   | `/api/auth/login`     | Login user      |

### Projects
| Method | Endpoint                      | Description           |
|--------|-------------------------------|-----------------------|
| GET    | `/api/projects`               | List user's projects  |
| POST   | `/api/projects`               | Create a project      |
| GET    | `/api/projects/:id`           | Get project details   |
| POST   | `/api/projects/:id/members`   | Add member to project |

### Tasks
| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| GET    | `/api/tasks`      | List user's tasks    |
| POST   | `/api/tasks`      | Create a task        |
| PUT    | `/api/tasks/:id`  | Update a task        |

---

## 🏃 Running Locally

### Prerequisites
- Node.js v20+
- PostgreSQL database (or use Railway's free tier)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mahak-12agrawal/team-task-manager.git
   cd team-task-manager
   ```

2. **Create a `.env` file** in the root:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   JWT_SECRET="your_secret_key_here"
   PORT=3000
   ```

3. **Install backend dependencies**
   ```bash
   npm install
   ```

4. **Push database schema**
   ```bash
   npx prisma db push
   ```

5. **Install frontend dependencies and build**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   npm start
   ```

7. Open **http://localhost:3000**

---

## 🚂 Deployment (Railway)

This app is deployed on [Railway](https://railway.app) using:
- A **PostgreSQL** database service
- A **Node.js** web service connected to the database via `DATABASE_URL`
- Environment variables: `DATABASE_URL`, `JWT_SECRET`

The database schema is automatically applied at startup using `prisma db push`.

---

## 📝 Assignment Requirements Checklist

- [x] Authentication (Signup/Login)
- [x] Project & team management
- [x] Task creation, assignment & status tracking
- [x] Dashboard (tasks, status, overdue)
- [x] REST APIs
- [x] Database (PostgreSQL)
- [x] Proper validations & relationships
- [x] Role-based access control (Admin/Member)
- [x] Deployed on Railway (Live URL provided)
- [x] GitHub repository
- [x] README

---

## 👩‍💻 Author

**Mahak Agrawal**  
GitHub: [@Mahak-12agrawal](https://github.com/Mahak-12agrawal)
