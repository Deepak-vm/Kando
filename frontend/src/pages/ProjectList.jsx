import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        projectAPI.getAll()
            .then(r => setProjects(r.data.projects))
            .catch(() => toast.error('Failed to fetch projects'))
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setCreating(true);
        try {
            const r = await projectAPI.create(form);
            setProjects([r.data.project, ...projects]);
            toast.success('Project created!');
            setShowModal(false);
            setForm({ name: '', description: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Delete this project and all its data? This cannot be undone.')) return;
        try {
            await projectAPI.delete(id);
            setProjects(projects.filter(p => p.id !== id));
            toast.success('Project deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete project');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full text-gray-400">Loading projects...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                        <p className="text-gray-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        + New Project
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <div className="text-6xl mb-4">◫</div>
                        <p className="text-lg font-medium">No projects yet</p>
                        <p className="text-sm mt-1">Create your first project to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projects.map(project => {
                            const myMembership = project.members?.find(m => m.user?.id === user?.id);
                            const isAdmin = myMembership?.role === 'ADMIN';
                            return (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 group relative"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
                                            {project.name}
                                        </h2>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {isAdmin ? 'Admin' : 'Member'}
                                        </span>
                                    </div>
                                    {project.description && (
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description}</p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
                                        <span>👥 {project.members?.length || 0} members</span>
                                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={(e) => handleDelete(project.id, e)}
                                            className="absolute bottom-4 right-5 text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Create Project Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                            <h2 className="text-xl font-bold text-gray-900 mb-5">New Project</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Website Redesign"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="What is this project about?"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); setForm({ name: '', description: '' }); }}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating || !form.name.trim()}
                                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                                    >
                                        {creating ? 'Creating...' : 'Create Project'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProjectList;
