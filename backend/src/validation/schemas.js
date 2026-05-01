import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string(),
});

export const projectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(255),
    description: z.string().max(1000).optional(),
});

export const columnSchema = z.object({
    name: z.string().min(1, 'Column name is required').max(255),
});

const dueDateSchema = z.union([
    z.string().date(),
    z.string().datetime(),
]).optional().nullable();

export const taskSchema = z.object({
    title: z.string().min(1, 'Task title is required').max(500),
    description: z.string().max(5000).optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: dueDateSchema,
    assigneeId: z.string().uuid().optional().nullable(),
});

export const taskUpdateSchema = taskSchema.partial().extend({
    columnId: z.string().uuid().optional(),
});

export const memberSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['ADMIN', 'MEMBER']).optional(),
});

export const reorderColumnsSchema = z.object({
    columns: z.array(
        z.object({
            id: z.string().uuid(),
            position: z.number().int().nonnegative(),
        })
    ),
});

export const reorderTasksSchema = z.object({
    tasks: z.array(
        z.object({
            id: z.string().uuid(),
            columnId: z.string().uuid(),
            position: z.number().int().nonnegative(),
        })
    ),
    columnId: z.string().uuid(),
});
