import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: '▦' },
        { to: '/projects', label: 'Projects', icon: '◫' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-60 bg-gray-900 text-white flex flex-col flex-shrink-0">
                <div className="p-5 border-b border-gray-700">
                    <h1 className="text-xl font-bold text-white tracking-tight">Kando</h1>
                    <p className="text-gray-400 text-sm mt-1 truncate">{user?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            {user?.role || 'MEMBER'}
                        </span>
                    </div>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map(({ to, label, icon }) => {
                        const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <span className="text-base">{icon}</span>
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-3 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-colors text-sm"
                    >
                        <span className="text-base">⇥</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
