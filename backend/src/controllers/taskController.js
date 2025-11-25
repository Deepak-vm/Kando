import { prisma } from "../config/prisma.js";

const checkColumnOwnership = async (columnId, userId) => {
    const column = await prisma.column.findFirst({
        where: {
            id: columnId,
            board: {
                userId: userId
            }
        }
    });
    return column;
}

const checkTaskOwnership = async (taskId, userId) => {
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            column: {
                board: {
                    userId: userId
                }
            }
        }
    });
    return task;
}

const createTask = async (req, res) => {
    try {
        const { title } = req.body;
        const { columnId } = req.params;
        const userId = req.user.userId;

        const column = await checkColumnOwnership(columnId, userId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }

        if (!title) {
            return res.status(400).json({ message: "Task title is required" });
        }
        const task = await prisma.task.create({
            data: {
                title,
                columnId
            }
        });
        res.status(201).json({
            message: "Task created successfully",
            task
        })
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getTasks = async (req, res) => {
    try {
        const { columnId } = req.params;
        const userId = req.user.userId;

        const column = await checkColumnOwnership(columnId, userId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }
        const tasks = await prisma.task.findMany({
            where: {
                columnId
            },
            orderBy: {
                title: 'asc'
            }
        });
        res.status(200).json({
            message: "Tasks retrieved successfully",
            tasks
        })
    } catch (err) {
        console.error('Get tasks error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}
const getTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const task = await checkTaskOwnership(id, userId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            task
        });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const updateTask = async (req, res) => {
    try {
        const { title } = req.body;
        const { id } = req.params;
        const userId = req.user.userId;

        if (!title) {
            return res.status(400).json({ message: "Task title is required" });
        }

        const task = await checkTaskOwnership(id, userId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        const updatedTask = await prisma.task.update({
            where: { id: req.params.id },
            data: { title }
        });
        res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask
        })
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteTask = async (req, res) => {
    try {
        const task = await checkTaskOwnership(req.params.id, req.user.userId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const deletedTask = await prisma.task.delete({
            where: { id: req.params.id }
        });

        res.status(200).json({
            message: "Task deleted successfully",
            task: deletedTask
        });
    } catch (err) {
        console.error('Delete task error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { createTask, getTasks, getTask, updateTask, deleteTask };
