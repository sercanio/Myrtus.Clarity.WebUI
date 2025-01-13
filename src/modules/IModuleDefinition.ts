// src/modules/IModuleDefinition.ts

import type { ExtendedRouteObject } from '@/types/ExtendedRouteObject'; // Adjust the import path accordingly
import type { MenuProps } from 'antd';

/**
 * Describes what each module must or can provide.
 */
export interface IModuleDefinition {
  /**
   * A unique name or key to identify the module (e.g. "cms")
   */
  name: string;

  /**
   * React Router v6+ route definitions.
   * Each route can optionally include `requiredRoles` for protection.
   */
  routes: ExtendedRouteObject[];

  /**
   * Side Menu items for Ant Design (or your chosen UI library).
   * Typically a subtree for module-specific navigation.
   */
  sideMenuItems?: MenuProps['items'];

  /**
   * An optional initialization function if the module wants to
   * dynamically inject RTK Query endpoints or Redux slices, etc.
   */
  initStore?: () => void;
}
