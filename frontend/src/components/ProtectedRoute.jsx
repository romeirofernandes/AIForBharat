import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute: Guards routes based on authentication and role.
 * - If not logged in → redirect to /login
 * - If role mismatch → redirect to the correct dashboard
 */
export default function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirect to their correct dashboard
        const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
}
