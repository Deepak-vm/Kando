# TaskFlow — Project Management App

A full-stack project management application with role-based access control, Kanban boards, task assignment, and a live dashboard. Built with React, Node.js, Express, PostgreSQL, and Prisma.

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)
![Prisma](https://img.shields.io/badge/prisma-5.22.0-2D3748.svg)

## Features

### Authentication
- Signup and login with JWT tokens
- Passwords hashed with bcryptjs
- Auth state persisted across page refreshes

### Projects & Team Management
- Create projects with a name and description
- Invite team members by email
- Per-project roles: **Admin** and **Member**
- Admins can change member roles or remove members
- Project owner cannot be removed

### Task Management
- Tasks live inside columns on a Kanban board
- Full task form: title, description, status, priority, due date, assignee
- Tasks can only be assigned to project members
- Status: `TODO` → `IN PROGRESS` → `IN REVIEW` → `DONE`
- Priority levels: `LOW` / `MEDIUM` / `HIGH` / `URGENT` with colour-coded left borders
- Overdue detection based on due date
- Drag-and-drop tasks within and between columns
- Drag-and-drop to reorder columns

### Dashboard
- Total projects and how many you administrate
- Tasks assigned to you, created by you, and overdue count
- Status breakdown (TODO / IN PROGRESS / IN REVIEW / DONE)
- Overdue tasks list with priority indicators
- Recent activity feed

### Role-Based Access Control
| Action | Admin | Member |
|--------|-------|--------|
| Create / delete project | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Add / delete columns | ✅ | ❌ |
| Create tasks | ✅ | ✅ |
| Update tasks | ✅ | ✅ |
| Delete own tasks | ✅ | ✅ |
| Delete any task | ✅ | ❌ |

## Tech Stack

### Frontend
- **React 19** with Vite 7
- **React Router 7** — client-side routing
- **Tailwind CSS v4** — utility-first styling
- **@dnd-kit** — drag-and-drop
- **Axios** — HTTP client
- **React Hot Toast** — notifications

### Backend
- **Node.js + Express** — REST API
- **Prisma ORM** — database access
- **PostgreSQL** (Supabase) — relational database
- **JWT** — stateless authentication
- **bcryptjs** — password hashing

## Project Structure

```
Kando/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Layout.jsx          # Sidebar + nav shell
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx     # Auth state (user, role)
│       ├── pages/
│       │   ├── Auth.jsx            # Login / Register
│       │   ├── Dashboard.jsx       # Stats & overview
│       │   ├── ProjectList.jsx     # All projects
│       │   └── ProjectDetail.jsx   # Kanban board + members
│       └── services/
│           └── api.js              # Axios wrappers for all endpoints
│
└── backend/
    ├── prisma/
    │   └── schema.prisma           # All models + enums
    └── src/
        ├── controllers/
        │   ├── authController.js
        │   ├── projectController.js
        │   ├── memberController.js
        │   ├── columnController.js
        │   ├── taskController.js
        │   └── dashboardController.js
        ├── middleware/
        │   └── auth.js             # JWT verification
        ├── routes/
        │   ├── auth.js
        │   ├── project.js          # Projects + members + columns
        │   ├── task.js
        │   └── dashboard.js
        └── server.js
```

## Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL database (or a Supabase project)

### 1. Clone
```bash
git clone https://github.com/Deepak-vm/Kando.git
cd Kando
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file:
```bash
DATABASE_URL="postgresql://username:password@host:5432/dbname"
JWT_SECRET="a-long-random-secret"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

Apply the schema and generate the Prisma client:
```bash
npx prisma db push
npx prisma generate
```

Start the server:
```bash
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:
```bash
VITE_BACKEND_URL="http://localhost:3000"
```

Start the dev server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Reference

### Auth
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Create account | No |
| POST | `/auth/login` | Login | No |

### Projects
| Method | Path | Description | Role |
|--------|------|-------------|------|
| GET | `/projects` | List my projects | Any |
| POST | `/projects` | Create project | Any |
| GET | `/projects/:id` | Get project + board | Member |
| PUT | `/projects/:id` | Update project | Admin |
| DELETE | `/projects/:id` | Delete project | Admin |

### Members
| Method | Path | Description | Role |
|--------|------|-------------|------|
| GET | `/projects/:id/members` | List members | Member |
| POST | `/projects/:id/members` | Add member by email | Admin |
| PUT | `/projects/:id/members/:mId` | Change role | Admin |
| DELETE | `/projects/:id/members/:mId` | Remove member | Admin |

### Columns
| Method | Path | Description | Role |
|--------|------|-------------|------|
| GET | `/projects/:id/columns` | List columns | Member |
| POST | `/projects/:id/columns` | Create column | Admin |
| POST | `/projects/:id/columns/reorder` | Reorder columns | Admin |
| PUT | `/projects/:id/columns/:cId` | Rename column | Admin |
| DELETE | `/projects/:id/columns/:cId` | Delete column | Admin |

### Tasks
| Method | Path | Description | Role |
|--------|------|-------------|------|
| POST | `/columns/:cId/tasks` | Create task | Member |
| GET | `/tasks/:id` | Get task detail | Member |
| PUT | `/tasks/:id` | Update task | Member |
| DELETE | `/tasks/:id` | Delete task | Admin or Creator |
| POST | `/tasks/reorder` | Reorder tasks | Member |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Stats for current user |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Database connection check |

## Security

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days
- All non-auth routes require a valid Bearer token
- Role checks enforced server-side on every mutating request
- Assignees validated as project members before being set
- Cascade deletes keep the database consistent

## Roadmap

- [ ] Real-time updates via WebSockets
- [ ] Email notifications for task assignments
- [ ] File attachments on tasks
- [ ] Dark mode
- [ ] Activity log per project

