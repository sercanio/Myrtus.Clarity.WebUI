import React from 'react';
import type { IModuleDefinition } from '../IModuleDefinition';
import CmsContents from './pages/CmsContents';
import ContentAddPage from './pages/ContentAddPage';
import ContentEditPage from './pages/ContentEditPage'; // Import the new page
import MediaLibrary from './components/MediaLibrary';
import { addCmsEndpoints } from './store/services/cmsApi';  // Updated import
import { FileTextOutlined, EditOutlined, PlusOutlined, PictureOutlined, GlobalOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import SEOSettingsPage from './pages/SEOSettingsPage';
import { ROLES } from '@src/routes';

const sideMenuItems: MenuProps['items'] = [
  {
    key: 'content-management',
    icon: React.createElement(FileTextOutlined),
    label: 'Content Management',
    children: [
      {
        key: '/cms/contents',
        icon: React.createElement(EditOutlined),
        label: 'Contents',
      },
      {
        key: '/cms/contents/add',
        icon: React.createElement(PlusOutlined),
        label: 'Add Content',
      },
      {
        key: '/cms/media',
        icon: React.createElement(PictureOutlined),
        label: 'Media Library',
      },
      {
        key: '/cms/seo',
        icon: React.createElement(GlobalOutlined),
        label: 'SEO Settings',
      },
    ],
  },
];

/**
 * The module definition implementing your IModuleDefinition interface.
 */
const cmsModule: IModuleDefinition = {
  name: 'cms',
  routes: [
    {
      path: '/cms/contents',
      element: React.createElement(CmsContents),
      requiredRoles: [ROLES.ADMIN, ROLES.EDITOR],

    },
    {
      path: '/cms/contents/add',
      element: React.createElement(ContentAddPage),
      requiredRoles: [ROLES.ADMIN, ROLES.EDITOR],
    },
    {
      path: '/cms/contents/edit/:id',
      element: React.createElement(ContentEditPage),
      requiredRoles: [ROLES.ADMIN, ROLES.EDITOR],
    },
    {
      path: '/cms/media',
      element: React.createElement(MediaLibrary),
      requiredRoles: [ROLES.ADMIN, ROLES.EDITOR],
    },
    {
      path: '/cms/seo',
      element: React.createElement(SEOSettingsPage),
      requiredRoles: [ROLES.ADMIN, ROLES.EDITOR],
    },
  ],
  sideMenuItems,

  initStore: () => {
    /**
     * This is the key: we inject the endpoints dynamically 
     * only when the CMS module is "initialized".
     */
    addCmsEndpoints();
  },
};

export default cmsModule;
