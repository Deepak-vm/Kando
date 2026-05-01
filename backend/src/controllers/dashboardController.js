import { prisma } from "../config/prisma.js";

export const getDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;
        const now = new Date();

        const projectMemberships = await prisma.projectMember.findMany({
            where: { userId },
            include: {
                project: {
                    include: { _count: { select: { members: true, columns: true } } }
                }
            }
        });

        const projectIds = projectMemberships.map(m => m.projectId);

        const allTasks = await prisma.task.findMany({
            where: { column: { projectId: { in: projectIds } } },
            include: {
                column: { select: { projectId: true, name: true } },
                assignee: { select: { id: true, name: true } }
            }
        });

        const myTasks = allTasks.filter(t => t.assigneeId === userId);

        const statusBreakdown = {
            TODO: allTasks.filter(t => t.status === 'TODO').length,
            IN_PROGRESS: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
            IN_REVIEW: allTasks.filter(t => t.status === 'IN_REVIEW').length,
            DONE: allTasks.filter(t => t.status === 'DONE').length,
        };

        const overdueTasks = myTasks.filter(
            t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
        );

        const recentTasks = [...allTasks]
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);

        res.json({
            projects: {
                total: projectMemberships.length,
                asAdmin: projectMemberships.filter(m => m.role === 'ADMIN').length,
                list: projectMemberships.map(m => ({
                    ...m.project,
                    userRole: m.role
                }))
            },
            tasks: {
                total: allTasks.length,
                assignedToMe: myTasks.length,
                createdByMe: allTasks.filter(t => t.creatorId === userId).length,
                overdue: overdueTasks.length,
                statusBreakdown
            },
            recentTasks,
            overdueTasks: overdueTasks.slice(0, 5)
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};
