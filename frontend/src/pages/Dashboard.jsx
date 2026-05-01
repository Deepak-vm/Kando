import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
    TODO: 'bg-gray-100 text-gray-700 border border-gray-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border border-blue-200',
    IN_REVIEW: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    DONE: 'bg-green-50 text-green-700 border border-green-200',
};

const PRIORITY_DOT = {
    LOW: 'bg-gray-400',
    MEDIUM: 'bg-blue-500',
    HIGH: 'bg-orange-500',
    URGENT: 'bg-red-500',
};

const StatCard = ({ label, value, sub, accent }) => (
    <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${accent}`}>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardAPI.get()
            .then(r => setData(r.data))
            .catch(() => toast.error('Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full text-gray-400">
                    Loading dashboard...
                </div>
            </Layout>
        );
    }

    if (!data) return <Layout><div className="p-8 text-gray-400">No data.</div></Layout>;

    const { projects, tasks, recentTasks, overdueTasks } = data;

    return (
        <Layout>
            <div className="p-8 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Projects" value={projects.total} sub={`${projects.asAdmin} as Admin`} accent="border-blue-500" />
                    <StatCard label="Assigned to Me" value={tasks.assignedToMe} sub="open tasks" accent="border-purple-500" />
                    <StatCard label="Overdue" value={tasks.overdue} sub="need attention" accent="border-red-500" />
                    <StatCard label="Completed" value={tasks.statusBreakdown.DONE} sub="all time" accent="border-green-500" />
                </div>

                {/* Status breakdown */}
                <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
                    <h2 className="text-base font-semibold text-gray-700 mb-4">Task Status Breakdown</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(tasks.statusBreakdown).map(([status, count]) => (
                            <div key={status} className={`text-center p-4 rounded-lg ${STATUS_STYLES[status]}`}>
                                <div className="text-2xl font-bold">{count}</div>
                                <div className="text-xs mt-1 font-medium">{status.replace('_', ' ')}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Overdue tasks */}
                    <div className="bg-white rounded-xl p-5 shadow-sm">
                        <h2 className="text-base font-semibold text-red-600 mb-4">Overdue Tasks</h2>
                        {overdueTasks.length === 0 ? (
                            <p className="text-gray-400 text-sm">No overdue tasks. Keep it up!</p>
                        ) : (
                            <div className="space-y-2">
                                {overdueTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                        <div>
                                            <p className="font-medium text-sm text-gray-800">{task.title}</p>
                                            <p className="text-xs text-red-500 mt-0.5">
                                                Due {new Date(task.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My projects */}
                    <div className="bg-white rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-semibold text-gray-700">My Projects</h2>
                            <Link to="/projects" className="text-blue-600 text-xs hover:underline">View all →</Link>
                        </div>
                        {projects.list.length === 0 ? (
                            <p className="text-gray-400 text-sm">No projects yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {projects.list.slice(0, 5).map(project => (
                                    <Link
                                        key={project.id}
                                        to={`/projects/${project.id}`}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium text-sm text-gray-800">{project.name}</p>
                                            <p className="text-xs text-gray-400">{project._count?.members || 0} members</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${project.userRole === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {project.userRole}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent activity */}
                {recentTasks.length > 0 && (
                    <div className="bg-white rounded-xl p-5 shadow-sm mt-6">
                        <h2 className="text-base font-semibold text-gray-700 mb-4">Recent Activity</h2>
                        <div className="divide-y divide-gray-100">
                            {recentTasks.map(task => (
                                <div key={task.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm text-gray-800">{task.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Updated {new Date(task.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[task.status]}`}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
