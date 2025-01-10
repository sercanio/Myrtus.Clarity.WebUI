import { useSelector } from 'react-redux';
import type { RootState } from '@store/index';
import type { ReactNode } from 'react';
import ForbiddenAccess from './ForbiddenAccess';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { isUserLoading } = useSelector((state: RootState) => state.ui);

  // Show loading screen while checking authentication
  if (isUserLoading) {
    return <LoadingScreen />;
    // return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return null;
  }

  // Check for required roles
  if (requiredRoles.length > 0 && user) {
    const userRoleNames = user.roles?.map(role => role.name) || [];
    const hasRequiredRole = requiredRoles.some(role => userRoleNames.includes(role));
    
    if (!hasRequiredRole) {
      return <ForbiddenAccess />;
    }
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;