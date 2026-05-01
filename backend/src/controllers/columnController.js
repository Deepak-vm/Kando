import { prisma } from "../config/prisma.js";

const getMembership = async (projectId, userId) => {
    return await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } }
    });
};

export const getColumns = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.userId;

        const membership = await getMembership(projectId, userId);
        if (!membership) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        const columns = await prisma.column.findMany({
            where: { projectId },
            orderBy: { position: 'asc' },
            include: {
                tasks: {
                    orderBy: { position: 'asc' },
                    include: {
                        assignee: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });

        res.json({ columns });
    } catch (error) {
        console.error('Get columns error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createColumn = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name } = req.body;
        const userId = req.user.userId;

        const membership = await getMembership(projectId, userId);
        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({ message: "Admin access required" });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Column name is required" });
        }

        const maxPos = await prisma.column.aggregate({
            where: { projectId },
            _max: { position: true }
        });

        const column = await prisma.column.create({
            data: {
                name: name.trim(),
                projectId,
                position: (maxPos._max.position ?? -1) + 1
            }
        });

        res.status(201).json({ message: "Column created", column });
    } catch (error) {
        console.error('Create column error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateColumn = async (req, res) => {
    try {
        const { projectId, columnId } = req.params;
        const { name } = req.body;
        const userId = req.user.userId;

        const membership = await getMembership(projectId, userId);
        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({ message: "Admin access required" });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Column name is required" });
        }

        const column = await prisma.column.findFirst({
            where: { id: columnId, projectId }
        });
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }

        const updated = await prisma.column.update({
            where: { id: columnId },
            data: { name: name.trim() }
        });

        res.json({ message: "Column updated", column: updated });
    } catch (error) {
        console.error('Update column error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteColumn = async (req, res) => {
    try {
        const { projectId, columnId } = req.params;
        const userId = req.user.userId;

        const membership = await getMembership(projectId, userId);
        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({ message: "Admin access required" });
        }

        const column = await prisma.column.findFirst({
            where: { id: columnId, projectId }
        });
        if (!column) {
            return res.status(404).json({ message: "Column not found" });
        }

        await prisma.column.delete({ where: { id: columnId } });
        res.json({ message: "Column deleted" });
    } catch (error) {
        console.error('Delete column error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const reorderColumns = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { columns } = req.body;
        const userId = req.user.userId;

        const membership = await getMembership(projectId, userId);
        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({ message: "Admin access required" });
        }

        await Promise.all(
            columns.map(({ id, position }) =>
                prisma.column.update({ where: { id }, data: { position } })
            )
        );

        res.json({ message: "Columns reordered" });
    } catch (error) {
        console.error('Reorder columns error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};
