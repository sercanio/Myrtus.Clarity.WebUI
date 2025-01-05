import type { RouteObject } from 'react-router-dom';
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
   * React Router v6+ route definitions 
   * e.g. [{ path: '/cms/contents', element: <CmsContents /> }, ...]
   */
  routes: RouteObject[];

  /**
   * Side Menu items for Ant Design (or your chosen UI library)
   * e.g. a subtree for "Content Management"
   */
  sideMenuItems?: MenuProps['items'];

  /**
   * An optional initialization function if the module wants to 
   * dynamically inject RTK Query endpoints or Redux slices, etc.
   */
  initStore?: () => void;
}
