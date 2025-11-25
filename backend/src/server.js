import dotenv from "dotenv"
import express, { urlencoded } from "express"
import { prisma } from "./config/prisma.js";
import authRoutes from './routes/auth.js'
import boardRoutes from './routes/board.js'
import columnRoutes from './routes/column.js'
import taskRoutes from './routes/task.js'



const PORT = process.env.PORT || 4000

dotenv.config()
const app = express()

app.use(express.json())
app.use(urlencoded({ extended: true }))

//Routes
app.use('/auth', authRoutes)
app.use('/board', boardRoutes)
app.use('/', columnRoutes)
app.use('/', taskRoutes)



app.get('/health', async (req, res) => {
    try {
        await prisma.$connect();
        res.json({ status: "Database connected" })
    } catch (error) {
        res.status(500).json({ error: "Database connection error" })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})