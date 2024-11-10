import { Routes, Route, Navigate } from 'react-router-dom';
import Users from '../pages/Users';
import Roles from '../pages/Roles';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import { AuthCallback } from '../components/AuthCallback';
import ProtectedRoute from '../components/ProtectedRoute';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

// Define role constants
const ROLES = {
  ADMIN: 'Admin',
  REGISTERED: 'Registered'
} as const;

function AppRoutes() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/users" replace />
          ) : (
            <Navigate to="/" replace />
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
    </Routes>
  );
}

export default AppRoutes; 