<div align="center">

# 🗂️ Kando

### A full-stack project management app with Kanban boards, role-based access control, and a live activity dashboard.

[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/prisma-5.22.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [API Reference](#api-reference) · [Roadmap](#roadmap)

</div>

---

## ✨ Features

### 🔐 Authentication
- JWT-based signup and login
- Passwords hashed with **bcryptjs** (10 salt rounds)
- Auth state persisted across page refreshes

### 📁 Projects & Team Management
- Create projects with a name and description
- Invite team members by email
- Per-project roles: **Admin** and **Member**
- Admins can change member roles or remove members
- Project owner is protected from removal

### ✅ Task Management
- Tasks live inside columns on a fully interactive **Kanban board**
- Full task form: title, description, status, priority, due date, assignee
- Tasks can only be assigned to current project members
- **Status flow:** `TODO` → `IN PROGRESS` → `IN REVIEW` → `DONE`
- **Priority levels:** `LOW` / `MEDIUM` / `HIGH` / `URGENT` — colour-coded left borders
- Overdue detection based on due date
- Drag-and-drop tasks within and between columns
- Drag-and-drop to reorder columns

### 📊 Dashboard
- Overview: total projects, projects you administrate
- Your tasks: assigned to you, created by you, overdue count
- Status breakdown across all tasks
- Overdue task list with priority indicators
- Real-time activity feed

### 🛡️ Role-Based Access Control

| Action | Admin | Member |
|:---|:---:|:---:|
| Create / delete project | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Add / delete columns | ✅ | ❌ |
| Create tasks | ✅ | ✅ |
| Update tasks | ✅ | ✅ |
| Delete own tasks | ✅ | ✅ |
| Delete any task | ✅ | ❌ |

---

## 🛠️ Tech Stack

### Frontend
| Library | Purpose |
|:---|:---|
| **React 19** + Vite 7 | UI framework & build tool |
| **React Router 7** | Client-side routing |
| **Tailwind CSS v4** | Utility-first styling |
| **@dnd-kit** | Drag-and-drop interactions |
| **Axios** | HTTP client |
| **React Hot Toast** | Notifications |

### Backend
| Library | Purpose |
|:---|:---|
| **Node.js + Express** | REST API server |
| **Prisma ORM** | Database access layer |
| **PostgreSQL** (Render) | Relational database |
| **JWT** | Stateless authentication |
| **bcryptjs** | Password hashing |


## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL database 

### 1. Clone the Repository

```bash
git clone https://github.com/Deepak-vm/Kando.git
cd Kando
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
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

Start the dev server:

```bash
npm run dev
```

> Backend runs on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL="http://localhost:3000"
```

Start the dev server:

```bash
npm run dev
```

> Frontend runs on `http://localhost:5173`

---

## 📡 API Reference

### Auth

| Method | Path | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/auth/register` | Create a new account | No |
| `POST` | `/auth/login` | Login and receive JWT | No |

### Projects

| Method | Path | Description | Role |
|:---|:---|:---|:---|
| `GET` | `/projects` | List all my projects | Any |
| `POST` | `/projects` | Create a new project | Any |
| `GET` | `/projects/:id` | Get project + board data | Member |
| `PUT` | `/projects/:id` | Update project details | Admin |
| `DELETE` | `/projects/:id` | Delete a project | Admin |

### Members

| Method | Path | Description | Role |
|:---|:---|:---|:---|
| `GET` | `/projects/:id/members` | List all project members | Member |
| `POST` | `/projects/:id/members` | Add member by email | Admin |
| `PUT` | `/projects/:id/members/:mId` | Change a member's role | Admin |
| `DELETE` | `/projects/:id/members/:mId` | Remove a member | Admin |

### Columns

| Method | Path | Description | Role |
|:---|:---|:---|:---|
| `GET` | `/projects/:id/columns` | List all columns | Member |
| `POST` | `/projects/:id/columns` | Create a column | Admin |
| `POST` | `/projects/:id/columns/reorder` | Reorder columns | Admin |
| `PUT` | `/projects/:id/columns/:cId` | Rename a column | Admin |
| `DELETE` | `/projects/:id/columns/:cId` | Delete a column | Admin |

### Tasks

| Method | Path | Description | Role |
|:---|:---|:---|:---|
| `POST` | `/columns/:cId/tasks` | Create a task in a column | Member |
| `GET` | `/tasks/:id` | Get task details | Member |
| `PUT` | `/tasks/:id` | Update a task | Member |
| `DELETE` | `/tasks/:id` | Delete a task | Admin or Creator |
| `POST` | `/tasks/reorder` | Reorder tasks | Member |

### Dashboard & Health

| Method | Path | Description |
|:---|:---|:---|
| `GET` | `/dashboard` | Fetch stats for the current user |
| `GET` | `/health` | Database connection check |

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (10 salt rounds)
- JWT tokens expire after **7 days**
- All non-auth routes require a valid `Bearer` token
- Role checks enforced **server-side** on every mutating request
- Assignees validated as project members before being set
- **Cascade deletes** maintain database consistency

---
