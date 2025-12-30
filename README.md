# Kando 📋

A modern, full-stack Kanban board application built with React, Node.js, Express, and PostgreSQL. Features drag-and-drop functionality, task priorities, file attachments, and real-time board management.

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-19.2.0-blue.svg)
![Prisma](https://img.shields.io/badge/prisma-5.22.0-2D3748.svg)

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Board Management**: Create, view, update, and delete project boards
- **Column Management**: Organize tasks into customizable columns with drag-and-drop reordering
- **Advanced Task Management**: 
  - Create tasks with titles, descriptions, and detailed information
  - Priority levels (Low, Medium, High, Urgent) with color-coded indicators
  - Due dates with overdue detection
  - Drag-and-drop tasks within and between columns
  - Position-based ordering
- **File Attachments**: Upload and manage files using Cloudinary integration (up to 10MB)
- **Task Details Modal**: View and edit complete task information in a dedicated modal
- **Secure API**: Protected routes with JWT middleware
- **Database Persistence**: PostgreSQL with Prisma ORM (Supabase)

## 🚀 Live Demo

- **Frontend**: [https://kando-app.vercel.app](https://kando-app.vercel.app)
- **Backend API**: [https://kando-mzmg.onrender.com](https://kando-mzmg.onrender.com)


## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest UI library
- **Vite 7** - Next-generation build tool and dev server
- **React Router 7** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **@dnd-kit** - Modern drag-and-drop toolkit
- **Headless UI** - Accessible UI components
- **Heroicons** - Beautiful hand-crafted SVG icons
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client
- **Framer Motion** - Animation library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express** - Minimalist web framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Powerful relational database (Supabase)
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Cloud-based file storage
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Kando/
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
git clone https://github.com/Deepak-vm/Kando.git
cd Kando
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
DATABASE_URL="postgresql://username:password@localhost:5432/Kando"
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
- **Cascade Deletes**: Automatically cleans up related data


### 🗺️ Future Updates

- [ ] Board sharing and collaboration
- [ ] Real-time updates with WebSockets
- [ ] Email notifications
- [ ] Dark mode

