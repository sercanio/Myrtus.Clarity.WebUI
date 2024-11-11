import { Layout, Menu, theme } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

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
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={266}
      collapsedWidth={80}
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`
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