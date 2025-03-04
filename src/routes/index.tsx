// src/AppRoutes.tsx

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
import loadedModules from '@src/modules/modulesLoader';
import type { ExtendedRouteObject } from '@/types/ExtendedRouteObject'; // Adjust the import path accordingly
import LoginPage from '@src/pages/LoginPage';

// eslint-disable-next-line react-refresh/only-export-components
export const ROLES = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  REGISTERED: 'Registered',
} as const;

function AppRoutes() {

  const staticRoutes: ExtendedRouteObject[] = [
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      ),
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/auth/callback',
      element: <AuthCallback />,
    },
    {
      path: '/users',
      element: (
        <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
          <Users />
        </ProtectedRoute>
      ),
    },
    {
      path: '/roles',
      element: (
        <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
          <Roles />
        </ProtectedRoute>
      ),
    },
    {
      path: '/settings',
      element: (
        <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
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

  const moduleRoutes: ExtendedRouteObject[] = loadedModules.flatMap((mod) => mod.routes as ExtendedRouteObject[]);

  const appRoutes: ExtendedRouteObject[] = [...staticRoutes, ...moduleRoutes];

  return (
    <Routes>
      {appRoutes.map((route, i) => {
        // Destructure requiredRoles from the route
        const { requiredRoles, element, ...rest } = route;

        // Determine the element to render
        const routeElement = requiredRoles ? (
          <ProtectedRoute requiredRoles={requiredRoles}>
            {element}
          </ProtectedRoute>
        ) : (
          element
        );

      // @ts-expect-error React Router typing issue
      return <Route key={i} {...rest} element={routeElement} />;      
      })}
    </Routes>
  );
}

export default AppRoutes;
