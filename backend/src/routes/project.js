import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getProjects, createProject, getProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { getMembers, addMember, updateMemberRole, removeMember } from '../controllers/memberController.js';
import { getColumns, createColumn, updateColumn, deleteColumn, reorderColumns } from '../controllers/columnController.js';
import { projectSchema, memberSchema, columnSchema, reorderColumnsSchema } from '../validation/schemas.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', validate(projectSchema), createProject);
router.get('/:projectId', getProject);
router.put('/:projectId', validate(projectSchema), updateProject);
router.delete('/:projectId', deleteProject);

// Members sub-routes
router.get('/:projectId/members', getMembers);
router.post('/:projectId/members', validate(memberSchema), addMember);
router.put('/:projectId/members/:memberId', validate(memberSchema), updateMemberRole);
router.delete('/:projectId/members/:memberId', removeMember);

// Columns sub-routes
router.get('/:projectId/columns', getColumns);
router.post('/:projectId/columns', validate(columnSchema), createColumn);
router.post('/:projectId/columns/reorder', validate(reorderColumnsSchema), reorderColumns);
router.put('/:projectId/columns/:columnId', validate(columnSchema), updateColumn);
router.delete('/:projectId/columns/:columnId', deleteColumn);

export default router;
