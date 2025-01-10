import { Routes, Route, RouteObject } from 'react-router-dom';
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
import loadedModules from '@src/modules/modulesLoader';

const ROLES = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  REGISTERED: 'Registered',
} as const;

function AppRoutes() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);


  const staticRoutes: RouteObject[] = [
    {
      path: '/',
      element: isAuthenticated ? <Home /> : <Landing />,
    },
    {
      path: '/auth/callback',
      element: <AuthCallback />,
    },
    {
      path: '/users',
      element: (
        <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.REGISTERED]}>
          <Users />
        </ProtectedRoute>
      ),
    },
    {
      path: '/roles',
      element: (
        <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.REGISTERED]}>
          <Roles />
        </ProtectedRoute>
      ),
    },
    {
      path: '/settings',
      element: (
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      ),
    },
    {
      path: '/profile',
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },
    {
      path: '/audit-logs',
      element: (
        <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
          <AuditLogs />
        </ProtectedRoute>
      ),
    },
  ];

  const moduleRoutes = loadedModules.flatMap((mod) => mod.routes);

  const appRoutes = [...staticRoutes, ...moduleRoutes];

  return (
    <Routes>
      {appRoutes.map((route, i) => (
        <Route key={i} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
}

export default AppRoutes;