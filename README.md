# Trello Lite 📋

A modern, full-stack Kanban board application inspired by Trello, built with React, Node.js, Express, and PostgreSQL.

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## 🌟 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Board Management**: Create, view, and delete project boards
- **Kanban Columns**: Organize tasks into customizable columns (To Do, In Progress, Done, etc.)
- **Task Management**: Create, view, and delete tasks within columns
- **Secure API**: Protected routes with JWT middleware
- **Database Persistence**: PostgreSQL with Prisma ORM

## 🚀 Live Demo

- **Frontend**: [https://trello-lite-pi.vercel.app](https://trello-lite-pi.vercel.app)
- **Backend API**: [https://trello-lite-backend-tr8f.onrender.com](https://trello-lite-backend-tr8f.onrender.com)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
trello-lite/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Auth/       # Login & Register components
│   │   │   └── ui/         # Headless UI components (Dialog, Button, Form)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── pages/          # Page components
│   │   │   ├── Auth.jsx    # Authentication page
│   │   │   ├── BoardList.jsx  # Board list page
│   │   │   └── BoardDetail.jsx # Kanban board page
│   │   ├── services/       # API service layer
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
└── backend/                 # Node.js backend application
    ├── src/
    │   ├── config/         # Configuration files
    │   │   └── prisma.js   # Prisma client
    │   ├── controllers/    # Route controllers
    │   │   ├── authController.js
    │   │   ├── boardController.js
    │   │   ├── columnController.js
    │   │   └── taskController.js
    │   ├── middleware/     # Express middleware
    │   │   └── auth.js     # JWT authentication
    │   ├── routes/         # API routes
    │   │   ├── auth.js
    │   │   ├── board.js
    │   │   ├── column.js
    │   │   └── task.js
    │   └── server.js       # Express server
    ├── prisma/
    │   ├── schema.prisma   # Database schema
    │   └── migrations/     # Database migrations
    └── package.json        # Backend dependencies
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Deepak-vm/trello-lite.git
cd trello-lite
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env` file:**
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/trello_lite"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

**Run Prisma migrations:**
```bash
npx prisma generate
npx prisma migrate dev
```

**Start the backend server:**
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env` file:**
```bash
VITE_BACKEND_URL="http://localhost:3000"
```

**Start the frontend server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`



## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Boards (Protected)
- `GET /board` - Get all boards for user
- `GET /board/:id` - Get single board
- `POST /board` - Create new board
- `PUT /board/:id` - Update board
- `DELETE /board/:id` - Delete board

### Columns (Protected)
- `GET /boards/:boardId/columns` - Get all columns for board
- `POST /boards/:boardId/columns` - Create new column
- `PUT /columns/:id` - Update column
- `DELETE /columns/:id` - Delete column

### Tasks (Protected)
- `GET /columns/:columnId/tasks` - Get all tasks for column
- `GET /tasks/:id` - Get single task
- `POST /columns/:columnId/tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Health Check
- `GET /health` - Check database connection



## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Middleware validation on all protected endpoints
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Server-side validation on all inputs
- **Ownership Verification**: Users can only access their own data
- **Cascade Deletes**: Automatic cleanup of related data

```
## 🙏 Acknowledgments

- [Trello](https://trello.com) - Original inspiration
- [Headless UI](https://headlessui.com/) - Accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Prisma](https://www.prisma.io/) - Database ORM
- [Render](https://render.com/) - Backend hosting
- [Vercel](https://vercel.com/) - Frontend hosting



## 🗺️ Future Updates

- [ ] Drag and drop functionality for tasks
- [ ] Task descriptions and due dates
- [ ] Board sharing and collaboration
- [ ] Real-time updates with WebSockets
- [ ] Email notifications
- [ ] Dark mode

---

