import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon,
    CalendarIcon,
    FlagIcon,
    PaperClipIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { taskAPI } from '../services/api';
import toast from 'react-hot-toast';

const PRIORITY_COLORS = {
    LOW: 'bg-gray-100 text-gray-800 border-gray-300',
    MEDIUM: 'bg-blue-100 text-blue-800 border-blue-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    URGENT: 'bg-red-100 text-red-800 border-red-300'
};

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const TaskDetailModal = ({ isOpen, onClose, task, onUpdate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'MEDIUM');
            setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
            setAttachments(task.attachments || []);
        }
    }, [task]);

    const handleSave = async () => {
        try {
            const response = await taskAPI.update(task.id, {
                title,
                description,
                priority,
                dueDate: dueDate || null
            });
            toast.success('Task updated successfully!');
            onUpdate(response.data.task);
        } catch (error) {
            toast.error('Failed to update task');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await taskAPI.uploadAttachment(task.id, file);
            setAttachments([...attachments, response.data.attachment]);
            toast.success('File uploaded successfully!');
            e.target.value = ''; // Reset input
        } catch (error) {
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!confirm('Delete this attachment?')) return;

        try {
            await taskAPI.deleteAttachment(attachmentId);
            setAttachments(attachments.filter(a => a.id !== attachmentId));
            toast.success('Attachment deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete attachment');
        }
    };

    const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b p-6">
                                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                                        Task Details
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                            placeholder="Add a description..."
                                        />
                                    </div>

                                    {/* Priority and Due Date */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Priority */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <FlagIcon className="h-4 w-4 inline mr-1" />
                                                Priority
                                            </label>
                                            <select
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            >
                                                {PRIORITY_OPTIONS.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Due Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <CalendarIcon className="h-4 w-4 inline mr-1" />
                                                Due Date
                                            </label>
                                            <input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${isOverdue ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {isOverdue && (
                                                <p className="text-xs text-red-600 mt-1">Overdue!</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Priority Badge */}
                                    <div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${PRIORITY_COLORS[priority]}`}>
                                            {priority}
                                        </span>
                                    </div>

                                    {/* Attachments */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <PaperClipIcon className="h-4 w-4 inline mr-1" />
                                            Attachments
                                        </label>

                                        {/* Upload Button */}
                                        <div className="mb-3">
                                            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                <input
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    disabled={uploading}
                                                />
                                                {uploading ? 'Uploading...' : 'Upload File'}
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">Max 10MB</p>
                                        </div>

                                        {/* Attachments List */}
                                        {attachments.length > 0 ? (
                                            <div className="space-y-2">
                                                {attachments.map((attachment) => (
                                                    <div
                                                        key={attachment.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="flex items-center space-x-3 flex-1">
                                                            <PaperClipIcon className="h-5 w-5 text-gray-400" />
                                                            <div className="flex-1 min-w-0">
                                                                <a
                                                                    href={attachment.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm text-blue-600 hover:underline truncate block"
                                                                >
                                                                    {attachment.filename}
                                                                </a>
                                                                <p className="text-xs text-gray-500">
                                                                    {(attachment.fileSize / 1024).toFixed(2)} KB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteAttachment(attachment.id)}
                                                            className="text-red-500 hover:text-red-700 ml-2"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No attachments</p>
                                        )}
                                    </div>

                                    {/* Timestamps */}
                                    {task?.createdAt && (
                                        <div className="text-xs text-gray-500 pt-4 border-t">
                                            <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
                                            {task.updatedAt && (
                                                <p>Updated: {new Date(task.updatedAt).toLocaleString()}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end space-x-3 border-t p-6 bg-gray-50">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default TaskDetailModal;