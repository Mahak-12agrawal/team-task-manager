# Team Task Manager

A full-stack web application for project and task management with role-based access control, REST APIs, and a database.

## Features
- Authentication (Signup/Login) with JWT
- Project & team management
- Task creation, assignment & status tracking
- Dashboard (tasks, status, overdue)
- Role-based access control (Admin/Member)

## Tech Stack
- Frontend: React (Vite) + Vanilla CSS (Rich aesthetics)
- Backend: Node.js, Express
- Database: SQLite (via Prisma ORM)

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize Database:
   ```bash
   npx prisma db push
   ```

3. Run Backend (port 3000):
   ```bash
   npm run dev
   ```

4. Run Frontend (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```

## Deployment
This app is designed to be easily deployed on Railway. It uses a monorepo structure where the Node.js backend serves the compiled React frontend static files. 
Railway will automatically detect the `build` and `start` scripts in the `package.json`.
