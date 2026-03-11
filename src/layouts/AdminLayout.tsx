import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, BarChart2, LogOut, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/workers', label: 'Workers', icon: Users },
        { path: '/admin/sheet-types', label: 'Sheet Types', icon: FileText },
        { path: '/admin/attendance', label: 'Attendance', icon: CheckCircle2 },
        { path: '/admin/reports', label: 'Reports', icon: BarChart2 },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) =>
        path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(path);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-slate-950">
            {/* Admin Sidebar */}
            <aside className="hidden md:flex md:flex-col w-64 bg-gray-900 dark:bg-slate-950 text-white">
                <div className="p-5 border-b border-gray-800">
                    <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                    <p className="text-gray-400 text-sm mt-1 truncate">{user?.name ?? 'Administrator'}</p>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${active
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white dark:bg-gray-900/80 shadow px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {navItems.find(n => isActive(n.path))?.label ?? 'Admin'}
                    </h2>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-medium"
                        >
                            {theme === 'dark' ? (
                                <Sun size={16} className="text-yellow-400" />
                            ) : (
                                <Moon size={16} className="text-gray-600" />
                            )}
                            <span className="hidden sm:inline">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-300">{user?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-500 hover:text-red-700 transition-colors md:hidden"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
