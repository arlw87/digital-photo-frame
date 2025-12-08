import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { pb } from '../lib/pocketbase';
import { Upload, Image as ImageIcon, Settings, LogOut, Sun, Moon } from 'lucide-react';

export function NavBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        pb.authStore.clear();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/admin/upload', icon: Upload, label: 'Upload' },
        { path: '/admin/gallery', icon: ImageIcon, label: 'Gallery' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <nav className="relative z-50 mb-8">
            <div className="mx-auto px-6 py-4">
                <div className="flex justify-between items-center bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-lg">

                    {/* Logo / Brand */}
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🖼️</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                            Photo Frame
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${active
                                            ? 'bg-purple-500 text-white shadow-md scale-105'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-white/10 hover:text-purple-400'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="hidden sm:block font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-white/10 text-gray-700 dark:text-white transition-colors"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="h-6 w-px bg-white/20 mx-1"></div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium"
                            title="Logout"
                        >
                            <LogOut size={20} />
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
