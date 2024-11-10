import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, userProfile } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && userProfile) {
    const userRoleNames = userProfile.roles.map(role => role.name);
    const hasRequiredRole = requiredRoles.some(role => userRoleNames.includes(role));

    if (!hasRequiredRole) {
      return <Navigate to="/profile" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 