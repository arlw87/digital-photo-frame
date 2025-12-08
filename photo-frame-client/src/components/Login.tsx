import React, { useState } from 'react';
import { pb } from '../lib/pocketbase';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Try to login as a regular user first (for display users)
            try {
                await pb.collection('users').authWithPassword(email, password);
            } catch (userErr) {
                // If user login fails, try admin login
                await pb.admins.authWithPassword(email, password);
            }

            navigate('/admin/upload');
        } catch (err) {
            setError('Invalid email or password');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 z-50 p-3 rounded-full backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/20 transition-all shadow-lg"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {theme === 'light' ? (
                    <svg className="w-5 h-5 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                )}
            </button>

            {/* Login Card */}
            <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Glass morphism card */}
                    <div className="backdrop-blur-xl bg-white/10 dark:bg-black/30 rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20 dark:border-white/10">
                        <div className="text-center mb-8">
                            <div className="inline-block p-3 rounded-2xl backdrop-blur-md bg-white/20 dark:bg-white/5 mb-4">
                                <span className="text-4xl">🚀</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Photo Frame
                            </h1>
                            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                Admin Portal
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-xl backdrop-blur-md bg-red-500/20 dark:bg-red-500/20 p-4 text-sm text-red-900 dark:text-red-200 border border-red-500/30">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl backdrop-blur-md bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl backdrop-blur-md bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl backdrop-blur-md bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 px-4 py-3 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Launching...
                                    </span>
                                ) : (
                                    'Launch Admin Portal'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                🔒 Secure access to your digital photo frame
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
