import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Switch, Space, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  LoginOutlined,
  BulbOutlined,
  BulbFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { KeycloakService } from '../services/keycloak';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  isDarkMode: boolean;
  setDarkMode: (value: boolean) => void;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const Header = ({ isDarkMode, setDarkMode, collapsed, setCollapsed }: HeaderProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useSelector((state: RootState) => state.auth);
  const [isXLScreen, setIsXLScreen] = useState(window.innerWidth >= 1200);

  useEffect(() => {
    const handleResize = () => {
      setIsXLScreen(window.innerWidth >= 1200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = () => {
    KeycloakService.login();
  };

  const handleLogout = async () => {
    await KeycloakService.logout(localStorage.getItem('refresh_token') || '');
    dispatch(logout());
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text strong>{userProfile?.firstName} {userProfile?.lastName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{userProfile?.email}</Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  return (
    <AntHeader style={{ 
      padding: '0 24px', 
      background: isDarkMode ? '#141414' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      <Space>
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          onClick: () => setCollapsed(!collapsed),
          style: { position: 'relative', top: '1.5px', fontSize: '16px', cursor: 'pointer' }
        })}
        {isXLScreen && (
          <Tag color="cyan" style={{ margin: 0 }}>
            {modifierKey} + B
          </Tag>
        )}
      </Space>
      <Space>
        <Switch
          checkedChildren={<BulbOutlined />}
          unCheckedChildren={<BulbFilled />}
          checked={isDarkMode}
          onChange={setDarkMode}
        />

        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar 
                style={{ backgroundColor: '#1890ff' }}
                size="large"
                src={userProfile?.avatarUrl}
                icon={!userProfile?.avatarUrl && <UserOutlined />}
              />
            </Space>
          </Dropdown>
        ) : (
          <Space style={{ cursor: 'pointer' }} onClick={handleLogin}>
            <LoginOutlined />
            <Text>Login</Text>
          </Space>
        )}
      </Space>
    </AntHeader>
  );
};

export default Header;