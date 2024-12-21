import { Routes, Route } from 'react-router-dom';
import Users from '@pages/Users';
import Roles from '@pages/Roles';
import Settings from '@pages/Settings';
import Profile from '@pages/Profile';
import { AuthCallback } from '@components/AuthCallback';
import ProtectedRoute from '@components/ProtectedRoute';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/index';
import AuditLogs from '@pages/AuditLogs';
import Home from '@pages/Home';
import Landing from '@pages/Landing';

// Define role constants
const ROLES = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  REGISTERED: 'Registered',
} as const;

function AppRoutes() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Home />
          ) : (
            <Landing />
          )
        } 
      />
      
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route 
        path="/users" 
        element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.REGISTERED]}>
            <Users />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/roles" 
        element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.REGISTERED]}>
            <Roles />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/audit-logs" 
        element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <AuditLogs />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;