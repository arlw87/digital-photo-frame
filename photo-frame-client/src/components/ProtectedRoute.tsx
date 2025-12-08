import { Navigate } from 'react-router-dom';
import { pb } from '../lib/pocketbase';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    // Check if user is authenticated
    const isAuthenticated = pb.authStore.isValid;

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
