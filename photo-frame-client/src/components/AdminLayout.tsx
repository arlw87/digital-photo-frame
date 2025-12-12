import { Navigate, Outlet } from 'react-router-dom';
import { pb } from '../lib/pocketbase';
import { NavBar } from './NavBar';

export function AdminLayout() {
    // Check if user is authenticated
    const isAuthenticated = pb.authStore.isValid;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 transition-colors duration-500">
            {/* Animated background orbs - Shared across all admin pages */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Navigation Bar */}
            <NavBar />

            {/* Page Content */}
            <div className="relative z-10">
                <Outlet />
            </div>
        </div>
    );
}
