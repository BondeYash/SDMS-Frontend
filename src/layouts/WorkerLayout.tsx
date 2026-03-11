import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, History, Calendar, User, Sun, Moon, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const WorkerLayout: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/attendance', label: 'Attendance', icon: Clock },
        { path: '/history', label: 'History', icon: History },
        { path: '/earnings', label: 'Earnings', icon: Calendar },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const { theme, toggleTheme } = useTheme();

    return (
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 pb-16 md:pb-0">
            {/* Top Header for Mobile */}
            <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10 md:hidden flex items-center justify-between">
                    <h1 className="text-xl font-bold">Production Tracker</h1>
                <button
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-sm font-medium"
                >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
            </header>

            {/* Main Sidebar for Desktop */}
                <aside className="hidden md:flex md:flex-col w-64 bg-blue-700 dark:bg-slate-900 text-white fixed h-full">
                <div className="p-4 border-b border-blue-600 flex items-center justify-between">
                    <div className="text-xl font-bold">SDMS</div>
                    <button
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-600/40 hover:bg-blue-500/70 text-xs font-medium"
                    >
                        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                        <span className="hidden sm:inline">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${isActive ? 'bg-blue-800' : 'hover:bg-blue-600'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 p-4 max-w-5xl mx-auto w-full">
                <Outlet />
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 z-10 pb-env-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 cursor-pointer ${isActive ? 'text-blue-600' : 'text-gray-500'
                                }`}
                            >
                            <Icon size={24} />
                            <span className="text-xs">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default WorkerLayout;
