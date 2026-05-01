import { prisma } from "../config/prisma.js";

const getMembership = async (projectId, userId) => {
    return await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } }
    });
};

const getTaskWithProject = async (taskId) => {
    return await prisma.task.findUnique({
        where: { id: taskId },
        include: { column: { select: { projectId: true } } }
    });
};

const TASK_INCLUDE = {
    assignee: { select: { id: true, name: true, email: true } },
    creator: { select: { id: true, name: true, email: true } },
    comments: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
    },
    attachments: true
};

export const createTask = async (req, res) => {
    try {
        const { columnId } = req.params;
        const { title, description, priority, dueDate, assigneeId, status } = req.body;
        const userId = req.user.userId;

        const column = await prisma.column.findUnique({ where: { id: columnId } });
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }

        const membership = await getMembership(column.projectId, userId);
        if (!membership) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Task title is required" });
        }

        if (assigneeId) {
            const assigneeMembership = await getMembership(column.projectId, assigneeId);
            if (!assigneeMembership) {
                return res.status(400).json({ message: "Assignee must be a project member" });
            }
        }

        const maxPos = await prisma.task.aggregate({
            where: { columnId },
            _max: { position: true }
        });

        const task = await prisma.task.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                priority: priority || 'MEDIUM',
                status: status || 'TODO',
                dueDate: dueDate ? new Date(dueDate) : null,
                columnId,
                assigneeId: assigneeId || null,
                creatorId: userId,
                position: (maxPos._max.position ?? 0) + 1
            },
            include: TASK_INCLUDE
        });

        res.status(201).json({ message: "Task created", task });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.userId;

        const baseTask = await getTaskWithProject(taskId);
        if (!baseTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        const membership = await getMembership(baseTask.column.projectId, userId);
        if (!membership) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: TASK_INCLUDE
        });

        res.json({ task });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, priority, dueDate, assigneeId, status, columnId } = req.body;
        const userId = req.user.userId;

        const baseTask = await getTaskWithProject(taskId);
        if (!baseTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        const membership = await getMembership(baseTask.column.projectId, userId);
        if (!membership) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        if (assigneeId !== undefined && assigneeId !== null) {
            const assigneeMembership = await getMembership(baseTask.column.projectId, assigneeId);
            if (!assigneeMembership) {
                return res.status(400).json({ message: "Assignee must be a project member" });
            }
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (priority !== undefined) updateData.priority = priority;
        if (status !== undefined) updateData.status = status;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
        if (columnId !== undefined) updateData.columnId = columnId;

        const task = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: TASK_INCLUDE
        });

        res.json({ message: "Task updated", task });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.userId;

        const baseTask = await getTaskWithProject(taskId);
        if (!baseTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        const membership = await getMembership(baseTask.column.projectId, userId);
        if (!membership) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        if (membership.role !== 'ADMIN' && baseTask.creatorId !== userId) {
            return res.status(403).json({ message: "Only admins or the task creator can delete tasks" });
        }

        await prisma.task.delete({ where: { id: taskId } });
        res.json({ message: "Task deleted" });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const reorderTasks = async (req, res) => {
    try {
        const { tasks, columnId } = req.body;
        const userId = req.user.userId;

        const column = await prisma.column.findUnique({ where: { id: columnId } });
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }

        const membership = await getMembership(column.projectId, userId);
        if (!membership) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        await Promise.all(
            tasks.map(({ id, position, columnId: newColumnId }) =>
                prisma.task.update({
                    where: { id },
                    data: { position, columnId: newColumnId || columnId }
                })
            )
        );

        res.json({ message: "Tasks reordered" });
    } catch (error) {
        console.error('Reorder tasks error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};
