import { prisma } from "../config/prisma.js";

const getMembership = async (projectId, userId) => {
    return await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } }
    });
};

export const getMembers = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.userId;

        const membership = await getMembership(projectId, userId);
        if (!membership) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        const members = await prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } }
            },
            orderBy: { joinedAt: 'asc' }
        });

        res.json({ members });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addMember = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { email, role } = req.body;
        const userId = req.user.userId;

        const adminMembership = await getMembership(projectId, userId);
        if (!adminMembership || adminMembership.role !== 'ADMIN') {
            return res.status(403).json({ message: "Admin access required" });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({ message: "Email is required" });
        }

        const targetUser = await prisma.user.findUnique({ where: { email: email.trim() } });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found with that email" });
        }

        const existing = await getMembership(projectId, targetUser.id);
        if (existing) {
            return res.status(400).json({ message: "User is already a member of this project" });
        }

        const member = await prisma.projectMember.create({
            data: {
                projectId,
                userId: targetUser.id,
                role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
            },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } }
            }
        });

        res.status(201).json({ message: "Member added successfully", member });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateMemberRole = async (req, res) => {
    try {
        const { projectId, memberId } = req.params;
        const { role } = req.body;
        const userId = req.user.userId;

        const adminMembership = await getMembership(projectId, userId);
        if (!adminMembership || adminMembership.role !== 'ADMIN') {
            return res.status(403).json({ message: "Admin access required" });
        }

        if (!role || !['ADMIN', 'MEMBER'].includes(role)) {
            return res.status(400).json({ message: "Valid role (ADMIN or MEMBER) is required" });
        }

        const membership = await prisma.projectMember.findUnique({ where: { id: memberId } });
        if (!membership || membership.projectId !== projectId) {
            return res.status(404).json({ message: "Member not found" });
        }

        if (membership.userId === userId && role === 'MEMBER') {
            const adminCount = await prisma.projectMember.count({
                where: { projectId, role: 'ADMIN' }
            });
            if (adminCount <= 1) {
                return res.status(400).json({ message: "Cannot demote the only admin" });
            }
        }

        const updated = await prisma.projectMember.update({
            where: { id: memberId },
            data: { role },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });

        res.json({ message: "Role updated", member: updated });
    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { projectId, memberId } = req.params;
        const userId = req.user.userId;

        const adminMembership = await getMembership(projectId, userId);
        if (!adminMembership || adminMembership.role !== 'ADMIN') {
            return res.status(403).json({ message: "Admin access required" });
        }

        const membership = await prisma.projectMember.findUnique({ where: { id: memberId } });
        if (!membership || membership.projectId !== projectId) {
            return res.status(404).json({ message: "Member not found" });
        }

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (membership.userId === project.ownerId) {
            return res.status(400).json({ message: "Cannot remove the project owner" });
        }

        await prisma.projectMember.delete({ where: { id: memberId } });
        res.json({ message: "Member removed successfully" });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};
