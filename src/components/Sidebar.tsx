import { useEffect } from 'react';
import { Layout, Menu, theme, Grid } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  SafetyOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;
const { useBreakpoint } = Grid;

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const screens = useBreakpoint();

  const items: MenuProps['items'] = [
    {
      key: 'user-management',
      icon: <UserOutlined />,
      label: 'User Management',
      children: [
        {
          key: '/users',
          icon: <TeamOutlined />,
          label: 'Users',
        },
        {
          key: '/roles',
          icon: <SafetyOutlined />,
          label: 'Roles',
        },
      ],
    },
    {
      key: '/audit-logs',
      icon: <FileSearchOutlined />,
      label: 'Audit Logs',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  useEffect(() => {
    const handleTouchOutside = (event: TouchEvent | MouseEvent) => {
      if ((!screens.xxl && !screens.xl) && !collapsed) {
        const sidebarElement = document.querySelector('.ant-layout-sider');
        if (sidebarElement && !sidebarElement.contains(event.target as Node)) {
          setCollapsed(true);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchOutside);
    document.addEventListener('mousedown', handleTouchOutside);
    return () => {
      document.removeEventListener('touchstart', handleTouchOutside);
      document.removeEventListener('mousedown', handleTouchOutside);
    };
  }, [collapsed, screens.lg, screens.xxl, setCollapsed]);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={266}
      collapsedWidth={screens.xl ? 80 : 0}
      breakpoint="xl"
      onBreakpoint={(broken) => {
        if (broken) {
          setCollapsed(true);
        }
      }}
      style={{
        position: screens.xl ? 'static' : 'fixed',
        top: 0,
        left: 0,
        minHeight: '100vh',
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        zIndex: 10
      }}
    >
      <div style={{
        height: 32,
        margin: 16,
        background: token.colorPrimary,
        opacity: 0.2
      }} />
      <Menu
        mode="inline"
        defaultOpenKeys={['user-management']}
        selectedKeys={[location.pathname]}
        onClick={onClick}
        items={items}
        style={{
          background: token.colorBgContainer,
          color: token.colorText,
          borderRight: 'none'
        }}
      />
    </Sider>
  );
}

export default Sidebar;