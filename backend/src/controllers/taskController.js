// backend/src/controllers/taskController.js - UPDATED VERSION
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
        },
        include: {
            attachments: true,
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });
    return task;
}

const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const { columnId } = req.params;
        const userId = req.user.userId;

        const column = await checkColumnOwnership(columnId, userId);
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }

        if (!title) {
            return res.status(400).json({ message: "Task title is required" });
        }

        // Get the max position in the column
        const maxPosition = await prisma.task.aggregate({
            where: { columnId },
            _max: { position: true }
        });

        const task = await prisma.task.create({
            data: {
                title,
                description: description || null,
                priority: priority || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate) : null,
                columnId,
                position: (maxPosition._max.position || 0) + 1
            },
            include: {
                attachments: true,
                comments: true
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
            include: {
                attachments: true,
                comments: true
            },
            orderBy: {
                position: 'asc'
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
        const { title, description, priority, dueDate } = req.body;
        const { id } = req.params;
        const userId = req.user.userId;

        const task = await checkTaskOwnership(id, userId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (priority !== undefined) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

        const updatedTask = await prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                attachments: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
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

// Reorder tasks within a column or move between columns
const reorderTasks = async (req, res) => {
    try {
        const { taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = req.body;
        const userId = req.user.userId;

        // Verify task ownership
        const task = await checkTaskOwnership(taskId, userId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Verify column ownership
        const sourceColumn = await checkColumnOwnership(sourceColumnId, userId);
        const destColumn = await checkColumnOwnership(destinationColumnId, userId);

        if (!sourceColumn || !destColumn) {
            return res.status(404).json({ message: "Column not found" });
        }

        // If moving within same column
        if (sourceColumnId === destinationColumnId) {
            const tasks = await prisma.task.findMany({
                where: { columnId: sourceColumnId },
                orderBy: { position: 'asc' }
            });

            // Remove task from source position
            const [movedTask] = tasks.splice(sourceIndex, 1);
            // Insert at destination position
            tasks.splice(destinationIndex, 0, movedTask);

            // Update positions
            await Promise.all(
                tasks.map((t, index) =>
                    prisma.task.update({
                        where: { id: t.id },
                        data: { position: index }
                    })
                )
            );
        } else {
            // Moving between columns
            // Update source column tasks
            const sourceTasks = await prisma.task.findMany({
                where: { columnId: sourceColumnId },
                orderBy: { position: 'asc' }
            });

            const updatedSourceTasks = sourceTasks.filter(t => t.id !== taskId);
            await Promise.all(
                updatedSourceTasks.map((t, index) =>
                    prisma.task.update({
                        where: { id: t.id },
                        data: { position: index }
                    })
                )
            );

            // Update destination column tasks
            const destTasks = await prisma.task.findMany({
                where: { columnId: destinationColumnId },
                orderBy: { position: 'asc' }
            });

            destTasks.splice(destinationIndex, 0, task);

            await Promise.all(
                destTasks.map((t, index) =>
                    prisma.task.update({
                        where: { id: t.id },
                        data: {
                            position: index,
                            columnId: destinationColumnId
                        }
                    })
                )
            );
        }

        res.status(200).json({
            message: "Task reordered successfully"
        });
    } catch (err) {
        console.error('Reorder task error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Upload attachment to task
const uploadAttachment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.userId;

        const task = await checkTaskOwnership(taskId, userId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const attachment = await prisma.attachment.create({
            data: {
                filename: req.file.originalname,
                fileUrl: req.file.path, // Cloudinary URL
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                taskId
            }
        });

        res.status(201).json({
            message: "Attachment uploaded successfully",
            attachment
        });
    } catch (err) {
        console.error('Upload attachment error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete attachment
const deleteAttachment = async (req, res) => {
    try {
        const { attachmentId } = req.params;
        const userId = req.user.userId;

        const attachment = await prisma.attachment.findFirst({
            where: {
                id: attachmentId,
                task: {
                    column: {
                        board: {
                            userId
                        }
                    }
                }
            }
        });

        if (!attachment) {
            return res.status(404).json({ message: "Attachment not found" });
        }

        await prisma.attachment.delete({
            where: { id: attachmentId }
        });

        res.status(200).json({
            message: "Attachment deleted successfully"
        });
    } catch (err) {
        console.error('Delete attachment error:', err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    reorderTasks,
    uploadAttachment,
    deleteAttachment
};