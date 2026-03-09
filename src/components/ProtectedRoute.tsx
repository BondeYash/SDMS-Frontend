import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from './ui/Loader';

interface ProtectedRouteProps {
    adminOnly?: boolean;
    workerOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false, workerOnly = false }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <Loader fullScreen />;
    }

    if (!user) {
        console.log("No user found at", location.pathname, "Redirecting to /login");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const { role } = user;
    const path = location.pathname;

    console.log(`Route Access: path="${path}", userRole="${role}", adminOnly=${adminOnly}, workerOnly=${workerOnly}`);

    // Admin trying to access worker-only routes → redirect to admin panel
    if (workerOnly && role === 'admin' && !path.startsWith('/admin')) {
        console.log("Admin on worker route, redirecting to /admin");
        return <Navigate to="/admin" replace />;
    }

    // Non-admin trying to access admin-only routes → redirect to worker home
    if (adminOnly && role !== 'admin') {
        console.log("Non-admin on admin route, redirecting to /");
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
