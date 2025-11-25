import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardAPI, columnAPI, taskAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

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
    const [selectedColumnId, setSelectedColumnId] = useState(null);

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
            const response = await taskAPI.create(selectedColumnId, { title: taskTitle });
            setColumns(
                columns.map((col) =>
                    col.id === selectedColumnId
                        ? { ...col, tasks: [...col.tasks, response.data.task] }
                        : col
                )
            );
            toast.success('Task created successfully!');
            setShowTaskModal(false);
            setTaskTitle('');
            setSelectedColumnId(null);
        } catch (error) {
            toast.error('Failed to create task');
        }
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

            {/* Kanban Board */}
            <main className="p-6 overflow-x-auto">
                <div className="flex space-x-4 min-w-max">
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className="bg-gray-200 rounded-lg p-4 w-80 flex-shrink-0"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg">
                                    {column.name} ({column.tasks.length})
                                </h3>
                                <button
                                    onClick={() => handleDeleteColumn(column.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-2 mb-4">
                                {column.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm">{task.title}</p>
                                            <button
                                                onClick={() => handleDeleteTask(task.id, column.id)}
                                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedColumnId(column.id);
                                    setShowTaskModal(true);
                                }}
                                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2 rounded transition-colors"
                            >
                                + Add Task
                            </button>
                        </div>
                    ))}

                
                </div>
            </main>

            {/* Create Column Dialog */}
            <Transition appear show={showColumnModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={setShowColumnModal}>
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
                <Dialog as="div" className="relative z-10" onClose={setShowTaskModal}>
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

                                    <form onSubmit={handleCreateTask}>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Task Title
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

                                        <div className="mt-6 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                onClick={() => {
                                                    setShowTaskModal(false);
                                                    setTaskTitle('');
                                                    setSelectedColumnId(null);
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
        </div>
    );
};

export default BoardDetail;