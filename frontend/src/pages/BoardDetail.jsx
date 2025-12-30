import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardAPI, columnAPI, taskAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowLeftIcon, CalendarIcon, FlagIcon } from '@heroicons/react/24/outline';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskDetailModal from '../components/TaskDetailModal';

const PRIORITY_COLORS = {
    LOW: 'border-l-4 border-gray-400',
    MEDIUM: 'border-l-4 border-blue-500',
    HIGH: 'border-l-4 border-orange-500',
    URGENT: 'border-l-4 border-red-500'
};

// Sortable Task Card Component
const TaskCard = ({ task, onDelete, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow group cursor-move ${PRIORITY_COLORS[task.priority || 'MEDIUM']}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium flex-1">{task.title}</p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>

            {task.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
                {task.dueDate && (
                    <span className={`flex items-center ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                )}
                {task.priority && (
                    <span className="flex items-center">
                        <FlagIcon className="w-3 h-3 mr-1" />
                        {task.priority}
                    </span>
                )}
                {task.attachments?.length > 0 && (
                    <span>📎 {task.attachments.length}</span>
                )}
            </div>
        </div>
    );
};

// Sortable Column Component
const Column = ({ column, onDeleteColumn, onAddTask, onDeleteTask, onTaskClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column.id, data: { type: 'column' } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-gray-200 rounded-lg p-4 w-80 flex-shrink-0"
        >
            <div className="flex justify-between items-center mb-4 cursor-move" {...attributes} {...listeners}>
                <h3 className="font-semibold text-lg">
                    {column.name} ({column.tasks?.length || 0})
                </h3>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteColumn(column.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <SortableContext items={column.tasks?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 mb-4 min-h-[100px]">
                    {column.tasks?.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={(taskId) => onDeleteTask(taskId, column.id)}
                            onClick={() => onTaskClick(task)}
                        />
                    ))}
                </div>
            </SortableContext>

            <button
                onClick={() => onAddTask(column.id)}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2 rounded transition-colors"
            >
                + Add Task
            </button>
        </div>
    );
};

const BoardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showColumnModal, setShowColumnModal] = useState(false);
    const [columnName, setColumnName] = useState('');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskPriority, setTaskPriority] = useState('MEDIUM');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [selectedColumnId, setSelectedColumnId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchBoardData();
    }, [id]);

    const fetchBoardData = async () => {
        try {
            const boardResponse = await boardAPI.getById(id);
            setBoard(boardResponse.data.board);

            const columnsResponse = await columnAPI.getAll(id);
            const columnsData = columnsResponse.data.columns;

            const columnsWithTasks = await Promise.all(
                columnsData.map(async (column) => {
                    try {
                        const tasksResponse = await taskAPI.getAll(column.id);
                        return { ...column, tasks: tasksResponse.data.tasks || [] };
                    } catch (error) {
                        return { ...column, tasks: [] };
                    }
                })
            );

            setColumns(columnsWithTasks);
        } catch (error) {
            toast.error('Failed to fetch board data');
            navigate('/boards');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateColumn = async (e) => {
        e.preventDefault();
        if (!columnName.trim()) return;

        try {
            const response = await columnAPI.create(id, { name: columnName });
            setColumns([...columns, { ...response.data.column, tasks: [] }]);
            toast.success('Column created successfully!');
            setShowColumnModal(false);
            setColumnName('');
        } catch (error) {
            toast.error('Failed to create column');
        }
    };

    const handleDeleteColumn = async (columnId) => {
        if (!confirm('Are you sure? This will delete all tasks in this column.')) return;

        try {
            await columnAPI.delete(columnId);
            setColumns(columns.filter((col) => col.id !== columnId));
            toast.success('Column deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete column');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        try {
            const response = await taskAPI.create(selectedColumnId, {
                title: taskTitle,
                description: taskDescription,
                priority: taskPriority,
                dueDate: taskDueDate || null
            });

            setColumns(
                columns.map((col) =>
                    col.id === selectedColumnId
                        ? { ...col, tasks: [...col.tasks, response.data.task] }
                        : col
                )
            );
            toast.success('Task created successfully!');
            setShowTaskModal(false);
            resetTaskForm();
        } catch (error) {
            toast.error('Failed to create task');
        }
    };

    const resetTaskForm = () => {
        setTaskTitle('');
        setTaskDescription('');
        setTaskPriority('MEDIUM');
        setTaskDueDate('');
        setSelectedColumnId(null);
    };

    const handleDeleteTask = async (taskId, columnId) => {
        try {
            await taskAPI.delete(taskId);
            setColumns(
                columns.map((col) =>
                    col.id === columnId
                        ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
                        : col
                )
            );
            toast.success('Task deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const handleTaskClick = async (task) => {
        try {
            const response = await taskAPI.getById(task.id);
            setSelectedTask(response.data.task);
            setShowTaskDetailModal(true);
        } catch (error) {
            toast.error('Failed to load task details');
        }
    };

    const handleTaskUpdate = (updatedTask) => {
        setColumns(columns.map(col => ({
            ...col,
            tasks: col.tasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
            )
        })));
        setSelectedTask(updatedTask);
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeTask = columns.flatMap(col => col.tasks).find(t => t.id === active.id);
        const activeColumn = columns.find(col => col.id === active.id);

        // Handle column reordering
        if (activeColumn) {
            const oldIndex = columns.findIndex(col => col.id === active.id);
            const newIndex = columns.findIndex(col => col.id === over.id);

            if (oldIndex !== newIndex) {
                const newColumns = arrayMove(columns, oldIndex, newIndex);
                setColumns(newColumns);

                try {
                    await columnAPI.reorder({
                        boardId: id,
                        sourceIndex: oldIndex,
                        destinationIndex: newIndex
                    });
                } catch (error) {
                    toast.error('Failed to reorder columns');
                    setColumns(columns); // Revert on error
                }
            }
        }
        // Handle task reordering
        else if (activeTask) {
            const sourceColumn = columns.find(col => col.tasks.some(t => t.id === active.id));
            let destinationColumn = columns.find(col => col.id === over.id);

            // If dropped on a task, find its column
            if (!destinationColumn) {
                destinationColumn = columns.find(col => col.tasks.some(t => t.id === over.id));
            }

            if (!sourceColumn || !destinationColumn) {
                setActiveId(null);
                return;
            }

            const sourceIndex = sourceColumn.tasks.findIndex(t => t.id === active.id);
            let destinationIndex;

            if (destinationColumn.id === over.id) {
                // Dropped on column itself - add to end
                destinationIndex = destinationColumn.tasks.length;
            } else {
                // Dropped on a task
                destinationIndex = destinationColumn.tasks.findIndex(t => t.id === over.id);
            }

            if (sourceColumn.id === destinationColumn.id) {
                // Same column reorder
                if (sourceIndex !== destinationIndex) {
                    const newTasks = arrayMove(sourceColumn.tasks, sourceIndex, destinationIndex);
                    setColumns(columns.map(col =>
                        col.id === sourceColumn.id ? { ...col, tasks: newTasks } : col
                    ));

                    try {
                        await taskAPI.reorder({
                            taskId: active.id,
                            sourceColumnId: sourceColumn.id,
                            destinationColumnId: destinationColumn.id,
                            sourceIndex,
                            destinationIndex
                        });
                    } catch (error) {
                        toast.error('Failed to reorder task');
                        setColumns(columns); // Revert
                    }
                }
            } else {
                // Move between columns
                const newSourceTasks = sourceColumn.tasks.filter(t => t.id !== active.id);
                const newDestTasks = [...destinationColumn.tasks];
                newDestTasks.splice(destinationIndex, 0, activeTask);

                setColumns(columns.map(col => {
                    if (col.id === sourceColumn.id) return { ...col, tasks: newSourceTasks };
                    if (col.id === destinationColumn.id) return { ...col, tasks: newDestTasks };
                    return col;
                }));

                try {
                    await taskAPI.reorder({
                        taskId: active.id,
                        sourceColumnId: sourceColumn.id,
                        destinationColumnId: destinationColumn.id,
                        sourceIndex,
                        destinationIndex
                    });
                } catch (error) {
                    toast.error('Failed to move task');
                    setColumns(columns); // Revert
                }
            }
        }

        setActiveId(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading board...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/boards')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">{board?.name}</h1>
                    </div>
                    <button
                        onClick={() => setShowColumnModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + Add Column
                    </button>
                </div>
            </header>

            {/* Kanban Board with Drag & Drop */}
            <main className="p-6 overflow-x-auto">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                        <div className="flex space-x-4 min-w-max">
                            {columns.map((column) => (
                                <Column
                                    key={column.id}
                                    column={column}
                                    onDeleteColumn={handleDeleteColumn}
                                    onAddTask={(columnId) => {
                                        setSelectedColumnId(columnId);
                                        setShowTaskModal(true);
                                    }}
                                    onDeleteTask={handleDeleteTask}
                                    onTaskClick={handleTaskClick}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </main>

            {/* Create Column Dialog */}
            <Transition appear show={showColumnModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setShowColumnModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                    <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                                        Create New Column
                                    </Dialog.Title>

                                    <form onSubmit={handleCreateColumn}>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Column Name
                                            </label>
                                            <input
                                                type="text"
                                                value={columnName}
                                                onChange={(e) => setColumnName(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="e.g., To Do, In Progress, Done"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="mt-6 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                onClick={() => {
                                                    setShowColumnModal(false);
                                                    setColumnName('');
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!columnName.trim()}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                                            >
                                                Create Column
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Create Task Dialog */}
            <Transition appear show={showTaskModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setShowTaskModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                    <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                                        Create New Task
                                    </Dialog.Title>

                                    <form onSubmit={handleCreateTask} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Task Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={taskTitle}
                                                onChange={(e) => setTaskTitle(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                placeholder="Enter task title"
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={taskDescription}
                                                onChange={(e) => setTaskDescription(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                                placeholder="Add a description..."
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Priority
                                                </label>
                                                <select
                                                    value={taskPriority}
                                                    onChange={(e) => setTaskPriority(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="URGENT">Urgent</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Due Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={taskDueDate}
                                                    onChange={(e) => setTaskDueDate(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                onClick={() => {
                                                    setShowTaskModal(false);
                                                    resetTaskForm();
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!taskTitle.trim()}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                                            >
                                                Create Task
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    isOpen={showTaskDetailModal}
                    onClose={() => setShowTaskDetailModal(false)}
                    task={selectedTask}
                    onUpdate={handleTaskUpdate}
                />
            )}
        </div>
    );
};

export default BoardDetail;