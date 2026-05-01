import dotenv from "dotenv"
import express, { urlencoded } from "express"
import cors from "cors"
import helmet from "helmet"
import { prisma } from "./config/prisma.js";
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/project.js'
import taskRoutes from './routes/task.js'
import dashboardRoutes from './routes/dashboard.js'

dotenv.config()

const PORT = process.env.PORT || 4000
const app = express()

// Security middleware
app.use(helmet())

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(urlencoded({ extended: true }))

app.get('/health', async (req, res) => {
    try {
        await prisma.$connect();
        res.json({ status: "Database connected" })
    } catch (error) {
        res.status(500).json({ error: "Database connection error" })
    }
})

app.use('/auth', authRoutes)
app.use('/projects', projectRoutes)
app.use('/', taskRoutes)
app.use('/dashboard', dashboardRoutes)

// Global error handler (must be last)
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ error: message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
