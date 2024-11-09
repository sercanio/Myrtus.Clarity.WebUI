import { Routes, Route, Navigate } from 'react-router-dom';
import Users from '../pages/Users';
import Roles from '../pages/Roles';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import { AuthCallback } from '../components/AuthCallback';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/users" replace />} />
      <Route path="/users" element={<Users />} />
      <Route path="/roles" element={<Roles />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}

export default AppRoutes; 