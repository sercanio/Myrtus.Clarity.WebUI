import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Space, Tag, Button, Typography, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
  BulbOutlined,
  BulbFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '@store/hooks';
import NotificationBell from '@components/NotificationBell';
import { useLazyGetCurrentUserQuery, useLogoutMutation } from '@store/services/accountApi';
import { logoutSuccess } from '@store/slices/authSlice';
import { api } from '@store/api';
import type { RootState } from '@store/index';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  isDarkMode: boolean;
  setDarkMode: (value: boolean) => void;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const Header = ({ isDarkMode, setDarkMode, collapsed, setCollapsed }: HeaderProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isXLScreen, setIsXLScreen] = useState(window.innerWidth >= 1200);
  const [, { data: userProfile }] = useLazyGetCurrentUserQuery();
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const handleResize = () => {
      setIsXLScreen(window.innerWidth >= 1200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutSuccess());
      dispatch(api.util.resetApiState());
      navigate('/login');
      message.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Typography.Text strong>
            {userProfile?.userName || user?.userName}
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            {userProfile?.email?.toString() || user?.email?.toString()}
          </Typography.Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
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
      key: 'theme',
      icon: isDarkMode ? <BulbOutlined /> : <BulbFilled />,
      label: 'Switch to ' + (isDarkMode ? 'Light' : 'Dark'),
      onClick: () => setDarkMode(!isDarkMode),
    },
    { type: 'divider' },
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
    <AntHeader style={{ padding: '0 24px', background: isDarkMode ? '#141414' : '#fff' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Space>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            onClick: () => setCollapsed(!collapsed),
            style: { fontSize: '16px', cursor: 'pointer' },
          })}
          {isXLScreen && <Tag color="cyan">{modifierKey} + B</Tag>}
        </Space>
        <Space align="center" size={24}>
          {isAuthenticated ? (
            <Space align="center" size={16}>
              <NotificationBell />
              <Dropdown menu={{ items: userMenuItems }} trigger={['hover']} placement="bottomLeft">
                <Space align="center" style={{ cursor: 'pointer' }}>
                  <Avatar size="large" src={user?.avatarUrl} icon={!user?.avatarUrl && <UserOutlined />} />
                  <Typography.Text strong>{user?.userName}</Typography.Text>
                </Space>
              </Dropdown>
            </Space>
          ) : (
            <Button type="primary" icon={<LoginOutlined />} onClick={handleLogin}>
              Login
            </Button>
          )}
        </Space>
      </Space>
    </AntHeader>
  );
};

export default Header;
