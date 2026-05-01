import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectAPI, columnAPI, taskAPI, memberAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import {
    DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
    SortableContext, arrayMove, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Constants ──────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const PRIORITY_BORDER = {
    LOW: 'border-l-4 border-gray-300',
    MEDIUM: 'border-l-4 border-blue-400',
    HIGH: 'border-l-4 border-orange-400',
    URGENT: 'border-l-4 border-red-500',
};

const STATUS_BADGE = {
    TODO: 'bg-gray-100 text-gray-600',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    IN_REVIEW: 'bg-yellow-100 text-yellow-700',
    DONE: 'bg-green-100 text-green-700',
};

// ─── Task Card ───────────────────────────────────────────────────────────────
const TaskCard = ({ task, onDelete, onClick, isAdmin, currentUserId }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
    const canDelete = isAdmin || task.creatorId === currentUserId;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${PRIORITY_BORDER[task.priority || 'MEDIUM']}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start gap-2 mb-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 flex-1">{task.title}</p>
                {canDelete && (
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(task.id); }}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-xs"
                    >
                        ✕
                    </button>
                )}
            </div>
            {task.description && (
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_BADGE[task.status || 'TODO']}`}>
                    {(task.status || 'TODO').replace('_', ' ')}
                </span>
                {task.dueDate && (
                    <span className={`text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                )}
                {task.assignee && (
                    <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">
                        {task.assignee.name.split(' ')[0]}
                    </span>
                )}
            </div>
        </div>
    );
};

// ─── Column ───────────────────────────────────────────────────────────────────
const KanbanColumn = ({ column, onDeleteColumn, onAddTask, onDeleteTask, onTaskClick, isAdmin, currentUserId }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: { type: 'column' }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-gray-100 rounded-xl p-3 w-72 flex-shrink-0 flex flex-col max-h-full"
        >
            <div
                className="flex justify-between items-center mb-3 cursor-move"
                {...attributes}
                {...listeners}
            >
                <h3 className="font-semibold text-gray-700 text-sm">
                    {column.name}
                    <span className="ml-2 text-xs font-normal text-gray-400">
                        {column.tasks?.length || 0}
                    </span>
                </h3>
                {isAdmin && (
                    <button
                        onClick={e => { e.stopPropagation(); onDeleteColumn(column.id); }}
                        className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                        title="Delete column"
                    >
                        ✕
                    </button>
                )}
            </div>

            <SortableContext items={column.tasks?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 flex-1 overflow-y-auto min-h-[60px] pr-0.5">
                    {column.tasks?.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={onDeleteTask}
                            onClick={() => onTaskClick(task, column)}
                            isAdmin={isAdmin}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            </SortableContext>

            <button
                onClick={() => onAddTask(column.id)}
                className="mt-3 w-full py-2 text-xs text-gray-500 hover:text-gray-800 hover:bg-white rounded-lg transition-colors border border-dashed border-gray-300 hover:border-gray-400"
            >
                + Add Task
            </button>
        </div>
    );
};

// ─── Task Modal ───────────────────────────────────────────────────────────────
const TaskModal = ({ task, column, columns, members, onClose, onSave, onDelete, isAdmin, currentUserId }) => {
    const isNew = !task?.id;
    const [form, setForm] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'TODO',
        priority: task?.priority || 'MEDIUM',
        dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
        assigneeId: task?.assigneeId || task?.assignee?.id || '',
        columnId: column?.id || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setSaving(true);
        try {
            await onSave(form, isNew ? form.columnId : task.id);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save task');
        } finally {
            setSaving(false);
        }
    };

    const canDelete = !isNew && (isAdmin || task.creatorId === currentUserId);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">{isNew ? 'New Task' : 'Edit Task'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Task title"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Task description"
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                            <select
                                value={form.priority}
                                onChange={e => setForm({ ...form, priority: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {PRIORITY_OPTIONS.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Assignee</label>
                            <select
                                value={form.assigneeId}
                                onChange={e => setForm({ ...form, assigneeId: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Unassigned</option>
                                {members.map(m => (
                                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {isNew && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Column</label>
                            <select
                                value={form.columnId}
                                onChange={e => setForm({ ...form, columnId: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {columns.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                        <div>
                            {canDelete && (
                                <button
                                    type="button"
                                    onClick={() => { onDelete(task.id); onClose(); }}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Delete task
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !form.title.trim()}
                                className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                            >
                                {saving ? 'Saving...' : isNew ? 'Create Task' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Members Panel ────────────────────────────────────────────────────────────
const MembersPanel = ({ projectId, members, onClose, onUpdate }) => {
    const [addEmail, setAddEmail] = useState('');
    const [addRole, setAddRole] = useState('MEMBER');
    const [adding, setAdding] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!addEmail.trim()) return;
        setAdding(true);
        try {
            const r = await memberAPI.add(projectId, { email: addEmail.trim(), role: addRole });
            toast.success('Member added!');
            setAddEmail('');
            onUpdate([...members, r.data.member]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add member');
        } finally {
            setAdding(false);
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        try {
            await memberAPI.updateRole(projectId, memberId, { role: newRole });
            onUpdate(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
            toast.success('Role updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role');
        }
    };

    const handleRemove = async (memberId) => {
        if (!confirm('Remove this member from the project?')) return;
        try {
            await memberAPI.remove(projectId, memberId);
            onUpdate(members.filter(m => m.id !== memberId));
            toast.success('Member removed');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove member');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>

                {/* Add member form */}
                <form onSubmit={handleAdd} className="p-4 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-600 mb-2">Add Member by Email</p>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={addEmail}
                            onChange={e => setAddEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={addRole}
                            onChange={e => setAddRole(e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="MEMBER">Member</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <button
                            type="submit"
                            disabled={adding || !addEmail.trim()}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                </form>

                {/* Members list */}
                <div className="flex-1 overflow-y-auto p-2">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-800">{member.user.name}</p>
                                <p className="text-xs text-gray-400">{member.user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={member.role}
                                    onChange={e => handleRoleChange(member.id, e.target.value)}
                                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                                >
                                    <option value="MEMBER">Member</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <button
                                    onClick={() => handleRemove(member.id)}
                                    className="text-red-400 hover:text-red-600 text-xs"
                                    title="Remove member"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Add Column Modal ─────────────────────────────────────────────────────────
const AddColumnModal = ({ projectId, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSaving(true);
        try {
            const r = await columnAPI.create(projectId, { name: name.trim() });
            onAdd(r.data.column);
            toast.success('Column added');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add column');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4">Add Column</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        placeholder="Column name"
                        required
                        autoFocus
                    />
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                        <button type="submit" disabled={saving || !name.trim()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {saving ? 'Adding...' : 'Add Column'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProjectDetail = () => {
    const { id: projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [columns, setColumns] = useState([]);
    const [members, setMembers] = useState([]);
    const [userRole, setUserRole] = useState('MEMBER');
    const [loading, setLoading] = useState(true);

    const [taskModal, setTaskModal] = useState(null); // { task, column } or null
    const [addingToColumn, setAddingToColumn] = useState(null);
    const [showMembers, setShowMembers] = useState(false);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [activeItem, setActiveItem] = useState(null);

    const isAdmin = userRole === 'ADMIN';

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => {
        projectAPI.getById(projectId)
            .then(r => {
                setProject(r.data.project);
                setColumns(r.data.project.columns || []);
                setMembers(r.data.project.members || []);
                setUserRole(r.data.userRole);
            })
            .catch(() => {
                toast.error('Project not found');
                navigate('/projects');
            })
            .finally(() => setLoading(false));
    }, [projectId]);

    // ── Task handlers ─────────────────────────────────────────────────────────
    const handleSaveTask = async (form, idOrColumnId) => {
        const isNew = !taskModal?.task?.id;
        if (isNew) {
            const r = await taskAPI.create(form.columnId, {
                title: form.title,
                description: form.description,
                status: form.status,
                priority: form.priority,
                dueDate: form.dueDate || null,
                assigneeId: form.assigneeId || null,
            });
            const newTask = r.data.task;
            setColumns(prev => prev.map(c =>
                c.id === form.columnId ? { ...c, tasks: [...(c.tasks || []), newTask] } : c
            ));
            toast.success('Task created!');
        } else {
            const r = await taskAPI.update(taskModal.task.id, {
                title: form.title,
                description: form.description,
                status: form.status,
                priority: form.priority,
                dueDate: form.dueDate || null,
                assigneeId: form.assigneeId || null,
            });
            const updated = r.data.task;
            setColumns(prev => prev.map(c => ({
                ...c,
                tasks: (c.tasks || []).map(t => t.id === updated.id ? updated : t)
            })));
            toast.success('Task updated!');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        try {
            await taskAPI.delete(taskId);
            setColumns(prev => prev.map(c => ({
                ...c,
                tasks: (c.tasks || []).filter(t => t.id !== taskId)
            })));
            toast.success('Task deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete task');
        }
    };

    // ── Column handlers ───────────────────────────────────────────────────────
    const handleDeleteColumn = async (columnId) => {
        if (!confirm('Delete this column and all its tasks?')) return;
        try {
            await columnAPI.delete(projectId, columnId);
            setColumns(prev => prev.filter(c => c.id !== columnId));
            toast.success('Column deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete column');
        }
    };

    // ── DnD handlers ──────────────────────────────────────────────────────────
    const findColumn = (id) => {
        return columns.find(c => c.id === id || c.tasks?.some(t => t.id === id));
    };

    const handleDragStart = ({ active }) => {
        const col = columns.find(c => c.id === active.id);
        if (col) { setActiveItem({ type: 'column', data: col }); return; }
        for (const c of columns) {
            const task = c.tasks?.find(t => t.id === active.id);
            if (task) { setActiveItem({ type: 'task', data: task }); return; }
        }
    };

    const handleDragEnd = async ({ active, over }) => {
        setActiveItem(null);
        if (!over || active.id === over.id) return;

        const activeCol = columns.find(c => c.id === active.id);
        if (activeCol) {
            // reorder columns
            const oldIdx = columns.findIndex(c => c.id === active.id);
            const newIdx = columns.findIndex(c => c.id === over.id);
            if (oldIdx === -1 || newIdx === -1) return;
            const reordered = arrayMove(columns, oldIdx, newIdx).map((c, i) => ({ ...c, position: i }));
            setColumns(reordered);
            try {
                await columnAPI.reorder(projectId, { columns: reordered.map(c => ({ id: c.id, position: c.position })) });
            } catch { toast.error('Failed to save column order'); }
            return;
        }

        // reorder tasks
        const sourceCol = findColumn(active.id);
        const targetCol = findColumn(over.id);
        if (!sourceCol || !targetCol) return;

        if (sourceCol.id === targetCol.id) {
            const tasks = sourceCol.tasks || [];
            const oldIdx = tasks.findIndex(t => t.id === active.id);
            const newIdx = tasks.findIndex(t => t.id === over.id);
            if (oldIdx === -1 || newIdx === -1) return;
            const reordered = arrayMove(tasks, oldIdx, newIdx).map((t, i) => ({ ...t, position: i }));
            setColumns(prev => prev.map(c => c.id === sourceCol.id ? { ...c, tasks: reordered } : c));
            try {
                await taskAPI.reorder({ columnId: sourceCol.id, tasks: reordered.map(t => ({ id: t.id, position: t.position, columnId: sourceCol.id })) });
            } catch { toast.error('Failed to save task order'); }
        } else {
            const movingTask = sourceCol.tasks.find(t => t.id === active.id);
            if (!movingTask) return;
            const updatedTask = { ...movingTask, columnId: targetCol.id };
            const newSourceTasks = sourceCol.tasks.filter(t => t.id !== active.id).map((t, i) => ({ ...t, position: i }));
            const targetTasks = targetCol.tasks || [];
            const overIdx = targetTasks.findIndex(t => t.id === over.id);
            const insertIdx = overIdx >= 0 ? overIdx : targetTasks.length;
            const newTargetTasks = [
                ...targetTasks.slice(0, insertIdx),
                updatedTask,
                ...targetTasks.slice(insertIdx),
            ].map((t, i) => ({ ...t, position: i }));

            setColumns(prev => prev.map(c => {
                if (c.id === sourceCol.id) return { ...c, tasks: newSourceTasks };
                if (c.id === targetCol.id) return { ...c, tasks: newTargetTasks };
                return c;
            }));
            try {
                await taskAPI.update(active.id, { columnId: targetCol.id });
                await taskAPI.reorder({ columnId: targetCol.id, tasks: newTargetTasks.map(t => ({ id: t.id, position: t.position, columnId: targetCol.id })) });
            } catch { toast.error('Failed to move task'); }
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full text-gray-400">Loading project...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Link to="/projects" className="text-gray-400 hover:text-gray-600 text-sm">← Projects</Link>
                        <span className="text-gray-300">/</span>
                        <h1 className="text-lg font-semibold text-gray-900">{project?.name}</h1>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {userRole}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowMembers(true)}
                            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                            👥 {members.length} members
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setShowAddColumn(true)}
                                className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition-colors"
                            >
                                + Column
                            </button>
                        )}
                    </div>
                </div>

                {/* Kanban board */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-5">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={columns.map(c => c.id)}>
                            <div className="flex gap-4 h-full">
                                {columns.map(col => (
                                    <KanbanColumn
                                        key={col.id}
                                        column={col}
                                        onDeleteColumn={handleDeleteColumn}
                                        onAddTask={(colId) => {
                                            setAddingToColumn(colId);
                                            setTaskModal({ task: null, column: col });
                                        }}
                                        onDeleteTask={handleDeleteTask}
                                        onTaskClick={(task, column) => setTaskModal({ task, column })}
                                        isAdmin={isAdmin}
                                        currentUserId={user?.id}
                                    />
                                ))}
                                {columns.length === 0 && (
                                    <div className="flex items-center justify-center w-full text-gray-400">
                                        <div className="text-center">
                                            <p className="text-lg">No columns yet</p>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => setShowAddColumn(true)}
                                                    className="mt-2 text-blue-600 text-sm hover:underline"
                                                >
                                                    Add your first column
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SortableContext>

                        <DragOverlay>
                            {activeItem?.type === 'task' && (
                                <div className={`bg-white p-3 rounded-lg shadow-xl ${PRIORITY_BORDER[activeItem.data.priority || 'MEDIUM']}`}>
                                    <p className="text-sm font-medium">{activeItem.data.title}</p>
                                </div>
                            )}
                            {activeItem?.type === 'column' && (
                                <div className="bg-gray-100 rounded-xl p-3 w-72 opacity-75">
                                    <h3 className="font-semibold text-gray-700 text-sm">{activeItem.data.name}</h3>
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

            {/* Modals */}
            {taskModal !== undefined && taskModal !== null && (
                <TaskModal
                    task={taskModal.task}
                    column={taskModal.column}
                    columns={columns}
                    members={members}
                    isAdmin={isAdmin}
                    currentUserId={user?.id}
                    onClose={() => setTaskModal(null)}
                    onSave={handleSaveTask}
                    onDelete={handleDeleteTask}
                />
            )}

            {showMembers && (
                <MembersPanel
                    projectId={projectId}
                    members={members}
                    onClose={() => setShowMembers(false)}
                    onUpdate={setMembers}
                />
            )}

            {showAddColumn && (
                <AddColumnModal
                    projectId={projectId}
                    onClose={() => setShowAddColumn(false)}
                    onAdd={col => setColumns(prev => [...prev, { ...col, tasks: [] }])}
                />
            )}
        </Layout>
    );
};

export default ProjectDetail;
