import React, { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';
import { Save } from 'lucide-react';

export function Settings() {
    const [interval, setInterval] = useState(30);
    const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
    const [sortOrder, setSortOrder] = useState('newest');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        if (pb.authStore.model) {
            // Load current settings from user profile
            const user = pb.authStore.model;
            if (user.slideshow_interval) setInterval(user.slideshow_interval);
            if (user.slideshow_fit) setFitMode(user.slideshow_fit);
            if (user.slideshow_order) setSortOrder(user.slideshow_order);
        }
    }

    async function handleSave() {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!pb.authStore.model) {
                console.error('No auth model found');
                return;
            }

            console.log('Current User Model:', pb.authStore.model);
            console.log('Is Admin?', pb.authStore.isAdmin);
            console.log('Updating User ID:', pb.authStore.model.id);

            // Check if user is actually in 'users' collection
            if (pb.authStore.isAdmin) {
                setError('Admin accounts cannot have slideshow settings. Please login as a regular user.');
                setLoading(false);
                return;
            }

            await pb.collection('users').update(pb.authStore.model.id, {
                slideshow_interval: interval,
                slideshow_fit: fitMode,
                slideshow_order: sortOrder,
            });

            setSuccess('Settings saved successfully!');

            // Refresh auth store to reflect changes
            await pb.collection('users').authRefresh();
        } catch (err) {
            console.error('Save failed:', err);
            setError('Failed to save settings');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-2xl mx-auto bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">

                {success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-100 text-center backdrop-blur-md">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100 text-center backdrop-blur-md">
                        {error}
                    </div>
                )}

                <div className="space-y-8">
                    {/* Interval Setting */}
                    <div className="space-y-4">
                        <label className="block text-xl font-medium text-white">
                            Slideshow Interval
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="5"
                                max="300"
                                step="5"
                                value={interval}
                                onChange={(e) => setInterval(Number(e.target.value))}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <span className="text-white font-mono min-w-[4rem] text-right">
                                {interval}s
                            </span>
                        </div>
                        <p className="text-white/60 text-sm">
                            How long each photo stays on screen before changing.
                        </p>
                    </div>

                    {/* Fit Mode Setting */}
                    <div className="space-y-4">
                        <label className="block text-xl font-medium text-white">
                            Image Fit Mode
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setFitMode('cover')}
                                className={`p-4 rounded-xl border transition-all ${fitMode === 'cover'
                                    ? 'bg-purple-500/50 border-purple-400 text-white shadow-lg scale-105'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                <div className="font-bold mb-2">Cover</div>
                                <div className="text-xs opacity-80">Fills screen, may crop edges</div>
                            </button>
                            <button
                                onClick={() => setFitMode('contain')}
                                className={`p-4 rounded-xl border transition-all ${fitMode === 'contain'
                                    ? 'bg-purple-500/50 border-purple-400 text-white shadow-lg scale-105'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    }`}
                            >
                                <div className="font-bold mb-2">Contain</div>
                                <div className="text-xs opacity-80">Shows full image, may have bars</div>
                            </button>
                        </div>
                    </div>

                    {/* Slideshow Order Setting */}
                    <div className="space-y-4">
                        <label className="block text-xl font-medium text-white">
                            Slideshow Order
                        </label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                        >
                            <option value="newest" className="bg-gray-900">Newest First</option>
                            <option value="oldest" className="bg-gray-900">Oldest First</option>
                            <option value="random" className="bg-gray-900">Random (Shuffle on Load)</option>
                            <option value="random_daily" className="bg-gray-900">Random (Daily Shuffle)</option>
                            <option value="random_hourly" className="bg-gray-900">Random (Hourly Shuffle)</option>
                        </select>
                        <p className="text-white/60 text-sm">
                            Controls the order in which photos are displayed.
                        </p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}
