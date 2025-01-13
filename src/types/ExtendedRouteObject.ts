// src/types/ExtendedRouteObject.ts

import { RouteObject } from 'react-router-dom';
import { Role } from '@constants/role'; // Adjust the import path accordingly

/**
 * Extends the RouteObject interface to include requiredRoles.
 */
export type ExtendedRouteObject = RouteObject & {
  /**
   * Specifies the roles required to access the route.
   * If omitted, the route is accessible to all authenticated users.
   */
  requiredRoles?: Role[];
};
