import { prisma } from "../config/prisma.js";

const getMembership = async (projectId, userId) => {
    return await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } }
    });
};

export const getProjects = async (req, res) => {
    try {
        const userId = req.user.userId;
        const projects = await prisma.project.findMany({
            where: { members: { some: { userId } } },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                },
                _count: { select: { columns: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ projects });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.userId;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Project name is required" });
        }

        const project = await prisma.project.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                ownerId: userId,
                members: { create: { userId, role: 'ADMIN' } },
                columns: {
                    createMany: {
                        data: [
                            { name: 'To Do', position: 0 },
                            { name: 'In Progress', position: 1 },
                            { name: 'In Review', position: 2 },
                            { name: 'Done', position: 3 },
                        ]
                    }
                }
            },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                },
                columns: { orderBy: { position: 'asc' } }
            }
        });

        res.status(201).json({ message: "Project created successfully", project });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.userId;

        const membership = await getMembership(projectId, userId);
        if (!membership) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                },
                columns: {
                    orderBy: { position: 'asc' },
                    include: {
                        tasks: {
                            orderBy: { position: 'asc' },
                            include: {
                                assignee: { select: { id: true, name: true, email: true } },
                                creator: { select: { id: true, name: true, email: true } },
                                _count: { select: { comments: true, attachments: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({ project, userRole: membership.role });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body;
        const userId = req.user.userId;

        const membership = await getMembership(projectId, userId);
        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({ message: "Admin access required" });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Project name is required" });
        }

        const project = await prisma.project.update({
            where: { id: projectId },
            data: { name: name.trim(), description: description?.trim() || null }
        });

        res.json({ message: "Project updated", project });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.userId;

        const membership = await getMembership(projectId, userId);
        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({ message: "Admin access required" });
        }

        await prisma.project.delete({ where: { id: projectId } });
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};
